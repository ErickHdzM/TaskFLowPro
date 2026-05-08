import { Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import { AppError } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/requireAuth';
import {
    insert as insertComment,
    drop as dropComment
} from './service';

export const insert = requireAuth(async (req:AuthRequest, res: Response) => {
    const task = req.params?.task_id;
    const usr_id = req.user!.id;
    const comment = req.body?.comment;
    const project_id = req.params?.project_id;
    
    if (!task || !usr_id || !comment){
        throw new AppError(400, 'Missing data');
    }

    const comment_response = await insertComment(project_id as string,task as string, usr_id, comment);
    if (!comment_response){
        throw new AppError(500, 'Error creating new comment')
    }
    res.status(200).json({ response: comment_response });
});

export const drop = requireAuth(async (req:AuthRequest, res:Response) => {
    const comment = req.params?.comment_id;
    const usr_id = req.user!.id;
    const project_id = req.params?.project_id;

    if (!comment){
        throw new AppError(400, 'Missing data');
    }
    const response = await dropComment(comment as string, usr_id, project_id as string);
    if (response === null || response.affected === 0){
        throw new AppError(500, 'Error deleting comment');
    }
    res.status(200).json({ response: 'Comment deleted' })
});

