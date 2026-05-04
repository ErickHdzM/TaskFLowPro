import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { search_credentials, isRefreshTokenValid, saveRefreshToken } from "./repository";
import { getByEmail, create_user } from "../users/repository";

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface CreateUserDTO {
    email: string;
    username?: string;
    password: string;
    first_name?: string;
    last_name?: string;
}

export interface RegisterResponse {
    user: {
        id: string;
        email: string;
        username: string | null;
        first_name: string | null;
        last_name: string | null;
    };
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    id: string;
    email: string;
    username: string
}


const REFRESH_SECRET: string = process.env.REFRESH_SECRET || 'refresh-secret';
const REFRESH_EXPIRE = parseInt(process.env.REFRESH_EXPIRE || '30', 10) * 24 * 60 * 60;
const ACCESS_TOKEN_EXPIRE = 60 * 60;
const JWT_SECRET: string = process.env.JWT_SECRET || "HOFISDJF-LJKN39569873";

export const login = async (email:string, password:string): Promise<JwtPayload | null> => {
    try{
        const usr = await search_credentials(email);
        if (!usr){
            return null;
        }

        const passwordMatch = await bcrypt.compare(password, usr.password_hash as string);
        if (!passwordMatch){
            return null;
        }

        return  {
            id: usr.id as string,
            email: usr.email as string,
            username: usr.username as string
        }
    }catch(err){
        console.log("[AUTH SERVICE] Error in login function",err)
        return null
    }
}

export const verifyToken = (token:string): JwtPayload | null => {
    try{
        const decode = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decode
    }catch (err){
        console.log("[AUTH SERVICE] Error in verifyToken function",err);
        return null;
    }
}

export const decodeToken = (token:string): JwtPayload | null => {
    try{
        const decode = jwt.decode(token) as JwtPayload;
        return decode
    }catch (err){
        console.log("[AUTH SERVICE] Error in decodeToken", err);
        return null;
    }
}

export const generateTokenPair = async (payload: Record<string, any>): Promise<TokenPair | null> => {
    const accessToken = jwt.sign(payload, JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRE });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET!, { expiresIn: REFRESH_EXPIRE });

    try{
        await saveRefreshToken(payload.id, refreshToken);
    }catch (err){
        console.log('[AUTH SERVICE] Error saving refresh token in database',err);
        return null
    }

    return { accessToken, refreshToken }
}

export const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
    try{
        const decode = jwt.verify(refreshToken, REFRESH_SECRET) as JwtPayload;
        const is_valid = await isRefreshTokenValid(decode.id, refreshToken);
        if (!is_valid){
            console.log('[AUTH SERVICE] Invalid refrersh token');
            return null;
        }
        return jwt.sign({id:decode.id, email:decode.email, username: decode.username}, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXPIRE});
    }catch (err){
        return null;
    }
}

export const register = async (dto: CreateUserDTO): Promise<RegisterResponse | null> => {
    try{
        const existing = await getByEmail(dto.email);
        if (existing){
            throw new Error("Email already in use");
        }

        const password_hash = await bcrypt.hash(dto.password, 10);
        const user = await create_user({ ...dto, password_hash });

        const payload: JwtPayload = {
            id: user.id,
            email: user.email,
            username: user.username || '',
        };

        const tokenPair = await generateTokenPair(payload);
        if (!tokenPair){
            throw new Error("Failed to generate tokens");
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
            },
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
        };
    }catch(err){
        console.log("[AUTH SERVICE] Error in register function", err);
        return null;
    }
}
