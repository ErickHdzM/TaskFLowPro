import { Response } from 'express';
import * as commentController from '../controller';
import * as commentService from '../service';

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

const mockCommentService = commentService as jest.Mocked<typeof commentService>;

describe('Task Comments Controller', () => {
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

    describe('insert', () => {
        it('should return 200 with the created comment', async () => {
            const comment = { id: 'c1', comment: 'Great task!', task_id: 't1' };
            mockRequest.params = { project_id: 'project-123', task_id: 't1' };
            mockRequest.body = { comment: 'Great task!' };
            mockCommentService.insert.mockResolvedValue(comment as any);

            await commentController.insert(mockRequest, mockResponse as Response, mockNext);

            expect(mockCommentService.insert).toHaveBeenCalledWith('project-123', 't1', 'user-123', 'Great task!');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ response: comment });
        });

        it('should call next with 400 if comment text is missing', async () => {
            mockRequest.params = { project_id: 'project-123', task_id: 't1' };
            mockRequest.body = {};

            await commentController.insert(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
            expect(mockCommentService.insert).not.toHaveBeenCalled();
        });

        it('should call next with 400 if task_id is missing', async () => {
            mockRequest.params = { project_id: 'project-123' };
            mockRequest.body = { comment: 'Nice!' };

            await commentController.insert(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });

        it('should call next with 500 if service returns null', async () => {
            mockRequest.params = { project_id: 'project-123', task_id: 't1' };
            mockRequest.body = { comment: 'Nice!' };
            mockCommentService.insert.mockResolvedValue(null as any);

            await commentController.insert(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
        });

        it('should call next with 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;

            await commentController.insert(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
        });
    });

    describe('drop', () => {
        it('should return 200 when comment is deleted', async () => {
            mockRequest.params = { project_id: 'project-123', task_id: 't1', comment_id: 'c1' };
            mockCommentService.drop.mockResolvedValue({ affected: 1 } as any);

            await commentController.drop(mockRequest, mockResponse as Response, mockNext);

            expect(mockCommentService.drop).toHaveBeenCalledWith('c1', 'user-123', 'project-123');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ response: 'Comment deleted' });
        });

        it('should call next with 400 if comment_id is missing', async () => {
            mockRequest.params = { project_id: 'project-123', task_id: 't1' };

            await commentController.drop(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });

        it('should call next with 500 if service returns null (user is not the author)', async () => {
            mockRequest.params = { project_id: 'project-123', task_id: 't1', comment_id: 'c1' };
            mockCommentService.drop.mockResolvedValue(null);

            await commentController.drop(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
        });

        it('should call next with 500 if delete affected 0 rows', async () => {
            mockRequest.params = { project_id: 'project-123', task_id: 't1', comment_id: 'c1' };
            mockCommentService.drop.mockResolvedValue({ affected: 0 } as any);

            await commentController.drop(mockRequest, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }));
        });
    });
});
