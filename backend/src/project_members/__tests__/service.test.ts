import * as membersService from '../service';
import * as membersRepository from '../rerpository';
import { historyEmitter } from '../../history/emitter';
import * as historyService from '../../history/service';
import { Actions, Resources } from '../../history/entity';
import { Roles } from '../entity';

jest.mock('../../history/service', () => ({
    canManipulateRecords: jest.fn(),
    toStringArray: jest.fn(),
}));
jest.mock('../../history/emitter', () => ({
    historyEmitter: { emit: jest.fn(), on: jest.fn() },
}));
jest.mock('../rerpository');

const mockRepository = membersRepository as jest.Mocked<typeof membersRepository>;
const mockHistoryService = historyService as jest.Mocked<typeof historyService>;
const mockEmit = historyEmitter.emit as jest.Mock;

describe('Project Members Service', () => {
    const mockMember = {
        id: 'member-123',
        user_id: 'user-456',
        project_id: 'project-123',
        role: Roles.EDITOR,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockHistoryService.toStringArray.mockReturnValue(['mock-value']);
    });

    describe('match_permission', () => {
        it('should return true when owner requests create on tasks', async () => {
            mockRepository.getByUserId.mockResolvedValue({ ...mockMember, role: Roles.OWNER } as any);

            const result = await membersService.match_permission('user-456', 'project-123', {
                resource: 'tasks',
                action: 'create',
            });

            expect(result).toBe(true);
        });

        it('should return false when editor tries to create a task', async () => {
            mockRepository.getByUserId.mockResolvedValue({ ...mockMember, role: Roles.EDITOR } as any);

            const result = await membersService.match_permission('user-456', 'project-123', {
                resource: 'tasks',
                action: 'create',
            });

            expect(result).toBe(false);
        });

        it('should return true when editor tries to update a task', async () => {
            mockRepository.getByUserId.mockResolvedValue({ ...mockMember, role: Roles.EDITOR } as any);

            const result = await membersService.match_permission('user-456', 'project-123', {
                resource: 'tasks',
                action: 'update',
            });

            expect(result).toBe(true);
        });

        it('should return false when editor tries to delete a project', async () => {
            mockRepository.getByUserId.mockResolvedValue({ ...mockMember, role: Roles.EDITOR } as any);

            const result = await membersService.match_permission('user-456', 'project-123', {
                resource: 'project',
                action: 'delete',
            });

            expect(result).toBe(false);
        });

        it('should return false if user is not a member of the project', async () => {
            mockRepository.getByUserId.mockResolvedValue(null);

            const result = await membersService.match_permission('user-456', 'project-123', {
                resource: 'tasks',
                action: 'create',
            });

            expect(result).toBe(false);
        });
    });

    describe('insert', () => {
        it('should add a member and emit a CREATE history record', async () => {
            mockRepository.getByUserId.mockResolvedValue(null);
            mockRepository.insert.mockResolvedValue(mockMember as any);

            await membersService.insert(
                { user_id: 'user-456', project_id: 'project-123', role: Roles.EDITOR },
                'user-123'
            );

            expect(mockEmit).toHaveBeenCalledWith('record', expect.objectContaining({
                project_id: 'project-123',
                user_id: 'user-123',
                resource: Resources.MEMBERS,
                action: Actions.CREATE,
                resource_id: 'member-123',
                old_value: [],
            }));
        });

        it('should throw and not emit if user is already in the project', async () => {
            mockRepository.getByUserId.mockResolvedValue(mockMember as any);

            await expect(
                membersService.insert(
                    { user_id: 'user-456', project_id: 'project-123', role: Roles.EDITOR },
                    'user-123'
                )
            ).rejects.toThrow('This user is already in the project');

            expect(mockEmit).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update member role and emit an UPDATE history record', async () => {
            mockHistoryService.canManipulateRecords.mockResolvedValue([Roles.EDITOR]);
            mockRepository.update.mockResolvedValue({ ...mockMember, role: Roles.ADMIN } as any);

            await membersService.update('member-123', Roles.ADMIN, 'project-123', 'user-123');

            expect(mockEmit).toHaveBeenCalledWith('record', expect.objectContaining({
                project_id: 'project-123',
                user_id: 'user-123',
                resource: Resources.MEMBERS,
                action: Actions.UPDATE,
                resource_id: 'member-123',
                field_changed: ['role'],
                old_value: [Roles.EDITOR],
                new_value: [Roles.ADMIN],
            }));
        });

        it('should throw 404 and not emit if member is not found', async () => {
            mockHistoryService.canManipulateRecords.mockResolvedValue([]);

            await expect(
                membersService.update('member-123', Roles.ADMIN, 'project-123', 'user-123')
            ).rejects.toMatchObject({ statusCode: 404 });

            expect(mockEmit).not.toHaveBeenCalled();
        });
    });

    describe('drop', () => {
        it('should remove a member and emit a DELETE history record', async () => {
            mockHistoryService.canManipulateRecords.mockResolvedValue(['user-456', Roles.EDITOR]);
            mockRepository.drop.mockResolvedValue(undefined);

            await membersService.drop('member-123', 'project-123', 'user-123');

            expect(mockEmit).toHaveBeenCalledWith('record', expect.objectContaining({
                project_id: 'project-123',
                user_id: 'user-123',
                resource: Resources.MEMBERS,
                action: Actions.DELETE,
                resource_id: 'member-123',
                old_value: ['user-456', Roles.EDITOR],
                new_value: [],
            }));
        });

        it('should throw 404 and not emit if member is not found', async () => {
            mockHistoryService.canManipulateRecords.mockResolvedValue([]);

            await expect(
                membersService.drop('member-123', 'project-123', 'user-123')
            ).rejects.toMatchObject({ statusCode: 404 });

            expect(mockEmit).not.toHaveBeenCalled();
        });
    });
});
