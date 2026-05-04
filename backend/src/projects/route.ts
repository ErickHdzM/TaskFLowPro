import { Router } from 'express';
import { authMiddleware } from '../middleware/authHandler';
import { requierePermission } from '../middleware/permissionHandler';
import * as projectController from './controller';

const projectsRouter = Router();

const resourse = 'project'

projectsRouter.get('/', authMiddleware, projectController.list);
projectsRouter.get('/:project_id', authMiddleware, requierePermission(resourse,'get'),projectController.get);
projectsRouter.post('/', authMiddleware, projectController.create);
projectsRouter.put('/:project_id', authMiddleware, requierePermission(resourse, 'update'), projectController.update);
projectsRouter.delete('/:project_id', authMiddleware, requierePermission(resourse, 'delete'),projectController.drop);

export default projectsRouter;
