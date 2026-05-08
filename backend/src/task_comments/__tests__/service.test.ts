import * as commentService from '../service';
import * as commentRepository from '../repository';
import { historyEmitter } from '../../history/emitter';
import * as historyService from '../../history/service';
import { Actions, Resources } from '../../history/entity';

jest.mock('../../history/service', () => ({
    canManipulateRecords: jest.fn(),
    toStringArray: jest.fn(),
}));
jest.mock('../../history/emitter', () => ({
    historyEmitter: { emit: jest.fn(), on: jest.fn() },
}));
jest.mock('../repository');

const mockRepository = commentRepository as jest.Mocked<typeof commentRepository>;
const mockHistoryService = historyService as jest.Mocked<typeof historyService>;
const mockEmit = historyEmitter.emit as jest.Mock;

describe('Task Comments Service', () => {
    const mockComment = {
        id: 'comment-123',
        task_id: 'task-123',
        author_id: 'user-123',
        comment: 'This is a comment',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockHistoryService.toStringArray.mockReturnValue(['This is a comment']);
    });

    describe('insert', () => {
        it('should create a comment and emit a CREATE history record', async () => {
            mockRepository.insert.mockResolvedValue(mockComment as any);

            const result = await commentService.insert('project-123', 'task-123', 'user-123', 'This is a comment');

            expect(result).toEqual(mockComment);
            expect(mockRepository.insert).toHaveBeenCalledWith({
                task_id: 'task-123',
                author_id: 'user-123',
                comment: 'This is a comment',
            });
            expect(mockEmit).toHaveBeenCalledWith('record', expect.objectContaining({
                project_id: 'project-123',
                user_id: 'user-123',
                resource: Resources.COMMENT,
                action: Actions.CREATE,
                resource_id: 'comment-123',
                field_changed: ['comment'],
                old_value: [],
            }));
        });
    });

    describe('drop', () => {
        it('should delete a comment and emit a DELETE history record', async () => {
            mockRepository.getAuthor.mockResolvedValue('user-123');
            mockHistoryService.canManipulateRecords.mockResolvedValue(['This is a comment']);
            mockRepository.drop.mockResolvedValue({ affected: 1 } as any);

            await commentService.drop('comment-123', 'user-123', 'project-123');

            expect(mockEmit).toHaveBeenCalledWith('record', expect.objectContaining({
                project_id: 'project-123',
                user_id: 'user-123',
                resource: Resources.COMMENT,
                action: Actions.DELETE,
                resource_id: 'comment-123',
                field_changed: ['comment'],
                old_value: ['This is a comment'],
                new_value: [],
            }));
        });

        it('should return null and not emit if the comment author is not found', async () => {
            mockRepository.getAuthor.mockResolvedValue(null);

            const result = await commentService.drop('comment-123', 'user-123', 'project-123');

            expect(result).toBeNull();
            expect(mockEmit).not.toHaveBeenCalled();
        });

        it('should return null and not emit if user is not the comment author', async () => {
            mockRepository.getAuthor.mockResolvedValue('different-user-id');

            const result = await commentService.drop('comment-123', 'user-123', 'project-123');

            expect(result).toBeNull();
            expect(mockEmit).not.toHaveBeenCalled();
        });
    });
});
