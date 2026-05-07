import { Router } from 'express';
import { authMiddleware } from '../middleware/authHandler';
import { requirePermission } from '../middleware/permissionHandler';
import * as projectController from './controller';

const projectsRouter = Router();

const resourse = 'project'

projectsRouter.get('/', authMiddleware, projectController.list);
projectsRouter.get('/:project_id', authMiddleware, requirePermission(resourse,'get'),projectController.get);
projectsRouter.post('/', authMiddleware, projectController.create);
projectsRouter.put('/:project_id', authMiddleware, requirePermission(resourse, 'update'), projectController.update);
projectsRouter.delete('/:project_id', authMiddleware, requirePermission(resourse, 'delete'),projectController.drop);

export default projectsRouter;
