import { Router } from 'express';
import { authMiddleware } from '../middleware/authHandler';
import { requierePermission } from '../middleware/permissionHandler';
import * as membersController from './controller';

const memberRouter = Router();

const resource = 'members';

memberRouter.get('/:project_id',authMiddleware, requierePermission(resource, 'get'), membersController.list);
memberRouter.post('/:project_id',authMiddleware, requierePermission(resource,'create'), membersController.insert);
memberRouter.put('/:project_id/:id',authMiddleware, requierePermission(resource,'update'), membersController.update);
memberRouter.delete('/:project_id/:id',authMiddleware, requierePermission(resource,'delete'), membersController.drop);

export default memberRouter;