import { Response } from 'express';
import * as taskController from '../controller';
import * as taskService from '../service';

jest.mock('../../middleware/errorHandler', () => {
    const original = jest.requireActual('../../middleware/errorHandler');
    return {
        ...original,
        asyncHandler: (fn: any) => async (req: any, res: any, next: any) => {
            try { await fn(req, res, next); } catch (err) { next(err); }
        },
    };
});
jest.mock('../service');
jest.mock('class-validator', () => ({
    validate: jest.fn().mockResolvedValue([]),
    IsString: () => () => {},
    IsOptional: () => () => {},
    IsEnum: () => () => {},
    IsUUID: () => () => {},
}));
jest.mock('class-transformer', () => ({
    plainToInstance: jest.fn().mockImplementation((_, obj) => obj),
}));

const mockTaskService = taskService as jest.Mocked<typeof taskService>;

describe('Task Controller', () => {
    let mockRequest: any;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockRequest = {
            body: {},
            params: { project_id: 'project-123' },
            user: { id: 'user-123', email: 'test@test.com', username: 'testuser' },
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('list', () => {
        it('should return 200 with tasks of a project', async () => {
            const tasks = [{ id: 't1', title: 'Task 1' }];
            mockTaskService.list.mockResolvedValue(tasks as any);

            await taskController.list(mockRequest, mockResponse as Response, mockNext);

            expect(mockTaskService.list).toHaveBeenCalledWith('project-123');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ response: tasks });
        });

        it('should call next with 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;

            await taskController.list(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
        });
    });

    describe('get', () => {
        it('should return 200 with a task by id', async () => {
            const task = { id: 't1', title: 'Task 1' };
            mockRequest.params = { project_id: 'project-123', id: 't1' };
            mockTaskService.get.mockResolvedValue(task as any);

            await taskController.get(mockRequest, mockResponse as Response, mockNext);

            expect(mockTaskService.get).toHaveBeenCalledWith('t1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ response: task });
        });

        it('should call next with 400 if task id is missing', async () => {
            mockRequest.params = { project_id: 'project-123' };

            await taskController.get(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });
    });

    describe('create', () => {
        it('should return 201 with the created task', async () => {
            const task = { id: 't1', title: 'New Task' };
            mockRequest.body = { title: 'New Task', priority: 'medium' };
            mockTaskService.insert.mockResolvedValue(task as any);

            await taskController.create(mockRequest, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ response: task });
        });

        it('should call next with 400 if validation fails', async () => {
            const { validate } = require('class-validator');
            validate.mockResolvedValueOnce([{ property: 'title', constraints: { isString: 'error' } }]);

            await taskController.create(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
            expect(mockTaskService.insert).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should return 200 when task is updated', async () => {
            mockRequest.params = { project_id: 'project-123', id: 't1' };
            mockRequest.body = { title: 'Updated Title' };
            mockTaskService.update.mockResolvedValue({ affected: 1 } as any);

            await taskController.update(mockRequest, mockResponse as Response, mockNext);

            expect(mockTaskService.update).toHaveBeenCalledWith('t1', expect.any(Object), 'project-123', 'user-123');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ response: 'task updated' });
        });

        it('should call next with 500 if no rows were affected', async () => {
            mockRequest.params = { project_id: 'project-123', id: 't1' };
            mockRequest.body = { title: 'Updated' };
            mockTaskService.update.mockResolvedValue({ affected: 0 } as any);

            await taskController.update(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
        });

        it('should call next with 400 if task id is missing', async () => {
            mockRequest.params = { project_id: 'project-123' };
            mockRequest.body = { title: 'Updated' };

            await taskController.update(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });
    });

    describe('changeStatus', () => {
        it('should return 200 when status is changed', async () => {
            mockRequest.params = { project_id: 'project-123', id: 't1' };
            mockRequest.body = { status: 'in progress' };
            mockTaskService.changeStatus.mockResolvedValue({ affected: 1 } as any);

            await taskController.changeStatus(mockRequest, mockResponse as Response, mockNext);

            expect(mockTaskService.changeStatus).toHaveBeenCalledWith('t1', 'in progress', 'project-123', 'user-123');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ response: 'status changed' });
        });

        it('should call next with 400 if status enum is invalid', async () => {
            const { validate } = require('class-validator');
            validate.mockResolvedValueOnce([{ property: 'status', constraints: { isEnum: 'error' } }]);
            mockRequest.params = { project_id: 'project-123', id: 't1' };
            mockRequest.body = { status: 'invalid_status' };

            await taskController.changeStatus(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
            expect(mockTaskService.changeStatus).not.toHaveBeenCalled();
        });

        it('should call next with 500 if no rows were affected', async () => {
            mockRequest.params = { project_id: 'project-123', id: 't1' };
            mockRequest.body = { status: 'in progress' };
            mockTaskService.changeStatus.mockResolvedValue({ affected: 0 } as any);

            await taskController.changeStatus(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
        });
    });

    describe('drop', () => {
        it('should return 200 when task is deleted', async () => {
            mockRequest.params = { project_id: 'project-123', id: 't1' };
            mockTaskService.drop.mockResolvedValue(undefined);

            await taskController.drop(mockRequest, mockResponse as Response, mockNext);

            expect(mockTaskService.drop).toHaveBeenCalledWith('t1', 'project-123', 'user-123');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ response: 'task deleted' });
        });

        it('should call next with 400 if task id is missing', async () => {
            mockRequest.params = { project_id: 'project-123' };

            await taskController.drop(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });
    });
});
