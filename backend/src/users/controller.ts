import { Request, Response } from "express";
import { getAll, createUser, get,type CreateUserDTO } from "./service";
import { AppError,asyncHandler } from "../middleware/errorHandler";

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    try {
        const users = await getAll();
        res.status(200).json(users);
    } catch (err) {
        throw new AppError(500, 'Error fetching users');
    }
});

export const getHandler = asyncHandler(async (req: Request, res: Response) => {
    try{
        const params = req.params;
        console.log("params: ",params);
        if (!params?.id){
            throw new AppError(400, 'Missing information')
        }
        const { id } =  params as { id:"string" };
        const user = await get(id);
        
        res.status(200).json(user);
    }catch (err){
        throw new AppError(500, 'Error fetching user')
    }
});

export const createUserHandler = asyncHandler(async (req: Request, res: Response) => {
    try {
        const dto: CreateUserDTO = req.body;
        console.log("request", req.body);
        const user = await createUser(dto);
        res.status(201).json(user);
    } catch (err) {
        if (err instanceof Error && err.message === "Email already in use") {
            throw new AppError(409, err.message)
        }
        throw new AppError(500,'Error creating user');
    }
});
