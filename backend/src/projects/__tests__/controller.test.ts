import { Response } from 'express';
import * as projectController from '../controller';
import * as projectService from '../service';

// Make asyncHandler return a real async function so `await controller(req, res, next)` waits properly.
// Without this, asyncHandler fires a promise internally without returning it,
// so assertions would run before the handler completes.
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
}));
jest.mock('class-transformer', () => ({
    plainToInstance: jest.fn().mockImplementation((_, obj) => obj),
}));

const mockProjectService = projectService as jest.Mocked<typeof projectService>;

describe('Project Controller', () => {
    let mockRequest: any;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockRequest = {
            body: {},
            params: {},
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
        it('should return 200 with the projects of the authenticated user', async () => {
            const projects = [{ id: 'p1', title: 'Project A' }];
            mockProjectService.list.mockResolvedValue(projects as any);

            await projectController.list(mockRequest, mockResponse as Response, mockNext);

            expect(mockProjectService.list).toHaveBeenCalledWith('user-123');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(projects);
        });

        it('should call next with 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;

            await projectController.list(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
        });
    });

    describe('get', () => {
        it('should return 200 with the requested project', async () => {
            const project = { id: 'p1', title: 'Project A' };
            mockRequest.params = { project_id: 'p1' };
            mockProjectService.get.mockResolvedValue(project as any);

            await projectController.get(mockRequest, mockResponse as Response, mockNext);

            expect(mockProjectService.get).toHaveBeenCalledWith({ project_id: 'p1', usr_id: 'user-123' });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ response: project });
        });

        it('should call next with 400 if project_id is missing', async () => {
            mockRequest.params = {};

            await projectController.get(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });
    });

    describe('create', () => {
        it('should return 201 with the created project', async () => {
            const project = { id: 'p1', title: 'New Project' };
            mockRequest.body = { title: 'New Project' };
            mockProjectService.create.mockResolvedValue(project as any);

            await projectController.create(mockRequest, mockResponse as Response, mockNext);

            expect(mockProjectService.create).toHaveBeenCalledWith({
                owner_id: 'user-123',
                title: 'New Project',
                description: undefined,
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(project);
        });

        it('should call next with 400 if validation fails', async () => {
            const { validate } = require('class-validator');
            validate.mockResolvedValueOnce([{ property: 'title', constraints: { isString: 'error' } }]);

            await projectController.create(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
            expect(mockProjectService.create).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should return 200 with the updated project', async () => {
            const updated = { id: 'p1', title: 'Updated Title' };
            mockRequest.params = { project_id: 'p1' };
            mockRequest.body = { title: 'Updated Title' };
            mockProjectService.update.mockResolvedValue(updated as any);

            await projectController.update(mockRequest, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ new_data: updated });
        });

        it('should call next with 500 if service returns null', async () => {
            mockRequest.params = { project_id: 'p1' };
            mockRequest.body = { title: 'Updated' };
            mockProjectService.update.mockResolvedValue(null as any);

            await projectController.update(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
        });

        it('should call next with 400 if project_id is missing', async () => {
            mockRequest.params = {};
            mockRequest.body = { title: 'Updated' };

            await projectController.update(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });
    });

    describe('drop', () => {
        it('should call service drop with correct args', async () => {
            mockRequest.params = { project_id: 'p1' };
            mockProjectService.drop.mockResolvedValue(undefined);

            await projectController.drop(mockRequest, mockResponse as Response, mockNext);

            expect(mockProjectService.drop).toHaveBeenCalledWith('p1', 'user-123');
        });

        it('should call next with 400 if project_id is missing', async () => {
            mockRequest.params = {};

            await projectController.drop(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });

        it('should call next with 500 if service throws', async () => {
            mockRequest.params = { project_id: 'p1' };
            mockProjectService.drop.mockRejectedValue(new Error('DB error'));

            await projectController.drop(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
        });
    });
});
