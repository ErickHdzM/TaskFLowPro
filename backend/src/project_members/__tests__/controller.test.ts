import { Response } from 'express';
import * as membersController from '../controller';
import * as membersService from '../service';

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
    IsUUID: () => () => {},
    IsEnum: () => () => {},
    IsOptional: () => () => {},
}));
jest.mock('class-transformer', () => ({
    plainToInstance: jest.fn().mockImplementation((_, obj) => obj),
}));

const mockMembersService = membersService as jest.Mocked<typeof membersService>;

describe('Project Members Controller', () => {
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
        it('should return 200 with members of a project', async () => {
            const members = [{ id: 'm1', user_id: 'user-123', role: 'editor' }];
            mockMembersService.list.mockResolvedValue(members as any);

            await membersController.list(mockRequest, mockResponse as Response, mockNext);

            expect(mockMembersService.list).toHaveBeenCalledWith('project-123');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ members });
        });

        it('should call next with 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;

            await membersController.list(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
        });
    });

    describe('insert', () => {
        it('should return 201 with the new member', async () => {
            const member = { id: 'm1', user_id: 'new-user', role: 'editor' };
            mockRequest.body = { user_id: 'new-user', role: 'editor' };
            mockMembersService.insert.mockResolvedValue(member as any);

            await membersController.insert(mockRequest, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ member_data: member });
        });

        it('should call next with 400 if validation fails', async () => {
            const { validate } = require('class-validator');
            validate.mockResolvedValueOnce([{ property: 'user_id', constraints: { isUUID: 'error' } }]);

            await membersController.insert(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
            expect(mockMembersService.insert).not.toHaveBeenCalled();
        });

        it('should call next with 400 if user is already in the project', async () => {
            mockRequest.body = { user_id: 'existing-user', role: 'editor' };
            mockMembersService.insert.mockRejectedValue(new Error('This user is already in the project'));

            await membersController.insert(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });
    });

    describe('update', () => {
        it('should return 200 when member role is updated', async () => {
            mockRequest.params = { project_id: 'project-123', id: 'm1' };
            mockRequest.body = { role: 'admin' };
            mockMembersService.update.mockResolvedValue(undefined);

            await membersController.update(mockRequest, mockResponse as Response, mockNext);

            expect(mockMembersService.update).toHaveBeenCalledWith('m1', 'admin', 'project-123', 'user-123');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'user updated' });
        });

        it('should call next with 400 if id or role is missing', async () => {
            mockRequest.params = { project_id: 'project-123' };
            mockRequest.body = {};

            await membersController.update(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });
    });

    describe('drop', () => {
        it('should return 200 when member is removed', async () => {
            mockRequest.params = { project_id: 'project-123', id: 'm1' };
            mockMembersService.drop.mockResolvedValue(undefined);

            await membersController.drop(mockRequest, mockResponse as Response, mockNext);

            expect(mockMembersService.drop).toHaveBeenCalledWith('m1', 'project-123', 'user-123');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'member deleted' });
        });

        it('should call next with 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;

            await membersController.drop(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
        });
    });
});
