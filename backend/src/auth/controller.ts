import {Request, Response} from 'express';
import { generateTokenPair, refreshAccessToken, login as login_service, register as register_service, CreateUserDTO } from "./service";

import { AppError, asyncHandler } from "../middleware/errorHandler";



export const login = asyncHandler(async (req:Request, res:Response) => {
    
    const body = req.body;
    console.log(body);

    if (!body?.email || !body?.password){
        throw new AppError(400, 'Email and password are requires')
    }

    const user = await login_service(body.email,body.password)

    if (!user){
        throw new AppError(401, "Invalid credentials")
    }

    const tokens = await generateTokenPair(user);
    if (!tokens){
        throw new AppError(500, 'Failed to generate tokens')
    }

    res.json(tokens);
});

export const refresh_controller = asyncHandler(async (req:Request, res:Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken){
        throw new AppError(400, 'I')
    }

    const newAccessToken = await refreshAccessToken(refreshToken);
    if (!newAccessToken){
        throw new AppError(401, 'Invalid refresh token')
    }
    res.json({accessToken: newAccessToken})
});

export const register = asyncHandler(async (req:Request, res:Response) => {
    try{
        const dto: CreateUserDTO = req.body;
        console.log(dto);
        if (!dto.email || !dto.password){
            throw new AppError(400, 'Email and passwrod are required')
        }

        const result = await register_service(dto);
        if (!result){
            throw new AppError(500, 'Error creating user')
        }

        res.status(201).json(result);
    }catch(err){
        if (err instanceof Error && err.message === "Email already in use"){
            throw new AppError(409, err.message)
        }
        console.log("[AUTH CONTROLLER] Error in register", err);
        throw new AppError(500, 'Internal server error')
    }
});