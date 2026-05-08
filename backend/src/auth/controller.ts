import {Request, Response} from 'express';
import { generateTokenPair, refreshAccessToken, login as login_service, register as register_service } from "./service";
import { CreateUserDTO, LoginDTO } from './dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppError, asyncHandler } from "../middleware/errorHandler";

export const login = asyncHandler(async (req:Request, res:Response) => {
    const dto = plainToInstance(LoginDTO, req.body);
    const err = await validate(dto);

    if (err.length > 0) {
        throw new AppError(400, 'Invalid project data');
    }

    const user = await login_service(dto.email,dto.password)

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
    
    const dto = plainToInstance(CreateUserDTO, req.body);
    const err = await validate(dto);

    if (err.length > 0) {
        throw new AppError(400, 'Invalid project data');
    }

    const result = await register_service(dto);
    if (!result){
        throw new AppError(500, 'Error creating user')
    }

    res.status(201).json(result);
    
});