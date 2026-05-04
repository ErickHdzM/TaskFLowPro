import { requireAuth, AuthRequest } from './requireAuth';
import { match_permission } from '../project_members/service';
import { AppError } from './errorHandler';

import { Response, NextFunction } from "express";

export const requierePermission = (resource: 'project' | 'members' | 'tasks' | 'comments', action: 'get' | 'create' | 'update' | 'delete') => {
    return requireAuth(async (
        req: AuthRequest,
        res: Response,
        next?: NextFunction
    ): Promise<void> => {
        const project_id = req.params.project_id as string;

        const hasPermission = await match_permission(req.user!.id, project_id, { resource, action });

        if (!hasPermission){
            throw new AppError(403, 'Insufficient permissions');
        }
        next?.();
    });
}