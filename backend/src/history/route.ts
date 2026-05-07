import { Router } from 'express';
import { authMiddleware } from '../middleware/authHandler';
import { requirePermission } from '../middleware/permissionHandler';
import { get } from './controller';

const historyRouter = Router();
const resource = 'history';

historyRouter.get('/:project_id', authMiddleware, requirePermission(resource, 'get'), get);

export default historyRouter;
