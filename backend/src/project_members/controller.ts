import { Response } from "express";
import { AppError } from '../middleware/errorHandler';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { requireAuth } from "../middleware/requireAuth";
import { AuthRequest } from "../middleware/requireAuth";
import { CreateMemberDTO } from './dto'
import {
    insert as insertMember,
    list as listMembers,
    update as updateMember,
    drop as dropMember,
} from './service'
import { Roles } from "./entity";

export const insert =  requireAuth(async (req:AuthRequest, res:Response) => {
    const dto = plainToInstance(CreateMemberDTO, req.body);
    dto.project_id = req.params!.project_id as string;
    const err = await validate(dto);

    if (err.length > 0) throw new AppError(400, 'Invalid data');
    try{
        const member = await insertMember(dto);
        res.status(201).json({member_data: member})
    }catch (err){
        throw new AppError(400, 'This user is alredy in the project');
    }
});

export const list = requireAuth(async (req:AuthRequest, res:Response) => {
    const members = await listMembers(req.params!.project_id as string);
    res.status(200).json({members: members})
});

export const update = requireAuth(async (req:AuthRequest, res:Response) => {
    const id = req.params?.id as string;
    const role: Roles = req.body?.role;
    if (!id || !role) throw new AppError(400, 'Missing information');
    await updateMember(id, role);
    res.status(200).json({message:'user updated'});
});

export const drop = requireAuth(async (req:AuthRequest, res:Response) => {
    const id = req.params?.id as string;
    try{
        await dropMember(id);
        res.status(200).json({message:'member deleted'})
    }catch (err){
        throw new AppError(404, 'Data not found')
    }
});