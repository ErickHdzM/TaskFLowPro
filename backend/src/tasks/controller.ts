import { Response } from 'express';
import { AppError } from "../middleware/errorHandler";
import { CreateTaskDTO,UpdateTaskDTO, ChangeStatusDTO } from "./dto";
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { requireAuth } from '../middleware/requireAuth';
import { AuthRequest } from '../middleware/requireAuth';
import {
    insert as insertTask,
    get as getTask,
    list as listTasks,
    update as updateTask,
    changeStatus as changeStatusTask,
    drop as dropTask
} from './service';

export const create = requireAuth( async (req: AuthRequest, res: Response) => {
    const dto = plainToInstance(CreateTaskDTO, req.body);
    const err = await validate(dto);

    if (err.length > 0){
        throw new AppError(400, 'Invalid data structure');
    }
    const prj_id = req.params?.project_id as string;
    const task = await insertTask({...dto,project_id:prj_id});
    res.status(201).json({ response:task });
});

export const get = requireAuth( async (req: AuthRequest, res: Response) => {
    const id = req.params?.id;
    if (!id) throw new AppError(400, 'Missing information')

    const task = await getTask(id as string);
    res.status(200).json({ response: task })
});

export const list = requireAuth(async (req: AuthRequest, res:Response) => {
    const prj_id = req.params?.project_id as string;
    if (!prj_id) throw new AppError(400, 'Missing project id');
    const tasks = await listTasks(prj_id);
    res.status(200).json({ response: tasks });
});

export const update = requireAuth(async (req:AuthRequest, res:Response) => {
    const dto = plainToInstance(UpdateTaskDTO, req.body);
    const err = await validate(dto);
    if (err.length > 0) throw new AppError(400, 'Missing information or bad format');

    const id = req.params?.id as string; 
    if (!id) throw new AppError(400,'Missing information');
    const task = await updateTask(id, dto);
    console.log(task);
    if (task.affected === 0){
        throw new AppError(500, 'No data affected');
    }
    res.status(200).json({ response: 'task updated' });
});

export const changeStatus = requireAuth(async (req: AuthRequest, res:Response) => {
    const dto = plainToInstance(ChangeStatusDTO, req.body);
    const err = await validate(dto);
    if (err.length > 0) throw new AppError(400, 'Missing information or bad format');

    const id = req.params?.id as string;
    if (!id) throw new AppError(400, 'Missing information');
    const task = await changeStatusTask(id, dto.status);
    console.log(task);
    if (task.affected === 0) throw new AppError(500, 'Fail to update task status')
    res.status(200).json({ response: 'status changed' })
});

export const drop = requireAuth(async (req: AuthRequest, res: Response) => {
    const id = req.params?.id;
    if (!id) throw new AppError(400, 'Missing Information');
    const response = await dropTask(id as string);
    console.log(response);
    res.status(200).json({ response: 'task deleted' })
});
