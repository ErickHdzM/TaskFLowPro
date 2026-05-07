import { Router } from "express";
import { insert, drop } from './controller';
import { authMiddleware } from '../middleware/authHandler';
import { requirePermission } from "../middleware/permissionHandler";

const commentRouter = Router();

const resource = 'comments';

commentRouter.post('/:project_id/:task_id', authMiddleware, requirePermission(resource,'create'), insert);
commentRouter.delete('/:project_id/:task_id/:comment_id',authMiddleware, requirePermission(resource,'delete'), drop);

export default commentRouter;