import { Router } from 'express';
import { authMiddleware } from '../middleware/authHandler';
import { requirePermission } from '../middleware/permissionHandler';
import {
    get,
    list,
    create,
    update,
    changeStatus,
    drop
} from './controller';

const taskRouter = Router();
const resource = 'tasks'

taskRouter.get('/:project_id', authMiddleware, requirePermission(resource,'get'),list);
taskRouter.get('/:project_id/:id',authMiddleware, requirePermission(resource,'get'), get);
taskRouter.post('/:project_id', authMiddleware, requirePermission(resource,'create'),create);
taskRouter.put('/:project_id/:id',authMiddleware, requirePermission(resource,'update'), update);
taskRouter.put('/:project_id/:id/change_status', authMiddleware, requirePermission(resource, 'change_status'),changeStatus);
taskRouter.delete('/:project_id/:id', authMiddleware, requirePermission(resource,'delete'),drop);

export default taskRouter;