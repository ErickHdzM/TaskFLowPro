import { Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/requireAuth';
import { AppError } from '../middleware/errorHandler';
import { get as getRecords, QueryFilters } from './service';
import { Actions, Resources } from './entity';

export const get = requireAuth(async (req: AuthRequest, res: Response) => {
    const project_id = req.params.project_id as string;
    if (!project_id) throw new AppError(400, 'Missing project_id');

    const filters: QueryFilters = { project_id };

    const { resource, action } = req.query;

    if (resource !== undefined) {
        if (!Object.values(Resources).includes(resource as Resources)) {
            throw new AppError(400, `Invalid resource. Valid values: ${Object.values(Resources).join(', ')}`);
        }
        filters.resource = resource as Resources;
    }

    if (action !== undefined) {
        if (!Object.values(Actions).includes(action as Actions)) {
            throw new AppError(400, `Invalid action. Valid values: ${Object.values(Actions).join(', ')}`);
        }
        filters.action = action as Actions;
    }

    const records = await getRecords(filters);
    res.status(200).json({ response: records });
});
