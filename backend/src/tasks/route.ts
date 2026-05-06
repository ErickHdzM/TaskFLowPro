import { Router } from 'express';
import { authMiddleware } from '../middleware/authHandler';
import { requierePermission } from '../middleware/permissionHandler';
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

taskRouter.get('/:project_id', authMiddleware, requierePermission(resource,'get'),list);
taskRouter.get('/:project_id/:id',authMiddleware, requierePermission(resource,'get'), get);
taskRouter.post('/:project_id', authMiddleware, requierePermission(resource,'create'),create);
taskRouter.put('/:project_id/:id',authMiddleware, requierePermission(resource,'update'), update);
taskRouter.put('/:project_id/:id/change_status', authMiddleware, requierePermission(resource, 'change_status'),changeStatus);
taskRouter.delete('/:project_id/:id', authMiddleware, requierePermission(resource,'delete'),drop);

export default taskRouter;