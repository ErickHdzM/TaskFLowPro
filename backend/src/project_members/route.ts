import { Router } from 'express';
import { authMiddleware } from '../middleware/authHandler';
import { requirePermission } from '../middleware/permissionHandler';
import * as membersController from './controller';

const memberRouter = Router();

const resource = 'members';

memberRouter.get('/:project_id',authMiddleware, requirePermission(resource, 'get'), membersController.list);
memberRouter.post('/:project_id',authMiddleware, requirePermission(resource,'create'), membersController.insert);
memberRouter.put('/:project_id/:id',authMiddleware, requirePermission(resource,'update'), membersController.update);
memberRouter.delete('/:project_id/:id',authMiddleware, requirePermission(resource,'delete'), membersController.drop);

export default memberRouter;