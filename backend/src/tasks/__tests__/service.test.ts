import * as taskService from '../service';
import * as taskRepository from '../repository';
import { historyEmitter } from '../../history/emitter';
import * as historyService from '../../history/service';
import { Actions, Resources } from '../../history/entity';
import { TicketStatus, TicketPriority } from '../entity';

// Explicit factory prevents history/service module code from running,
// which would call historyEmitter.on() before our mock is set up.
jest.mock('../../history/service', () => ({
    canManipulateRecords: jest.fn(),
    toStringArray: jest.fn(),
}));
jest.mock('../../history/emitter', () => ({
    historyEmitter: { emit: jest.fn(), on: jest.fn() },
}));
jest.mock('../repository');

const mockRepository = taskRepository as jest.Mocked<typeof taskRepository>;
const mockHistoryService = historyService as jest.Mocked<typeof historyService>;
const mockEmit = historyEmitter.emit as jest.Mock;

describe('Task Service', () => {
    const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        description: 'A description',
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        project_id: 'project-123',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockHistoryService.toStringArray.mockReturnValue(['mock-value']);
    });

    describe('insert', () => {
        it('should create a task and emit a CREATE history record', async () => {
            mockRepository.insert.mockResolvedValue(mockTask as any);

            const result = await taskService.insert(
                { title: 'Test Task', project_id: 'project-123' } as any,
                'user-123'
            );

            expect(result).toEqual(mockTask);
            expect(mockEmit).toHaveBeenCalledWith('record', expect.objectContaining({
                project_id: 'project-123',
                user_id: 'user-123',
                resource: Resources.TASK,
                action: Actions.CREATE,
                resource_id: 'task-123',
                old_value: [],
            }));
        });

        it('should throw if the repository returns null', async () => {
            mockRepository.insert.mockResolvedValue(null as any);

            await expect(
                taskService.insert({ title: 'Test', project_id: 'project-123' } as any, 'user-123')
            ).rejects.toThrow('Unexpected error');

            expect(mockEmit).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update a task and emit an UPDATE history record', async () => {
            mockHistoryService.canManipulateRecords.mockResolvedValue(['Old Title']);
            mockRepository.update.mockResolvedValue({ affected: 1 } as any);

            await taskService.update('task-123', { title: 'New Title' } as any, 'project-123', 'user-123');

            expect(mockHistoryService.canManipulateRecords).toHaveBeenCalledWith('tasks', 'task-123', ['title']);
            expect(mockEmit).toHaveBeenCalledWith('record', expect.objectContaining({
                project_id: 'project-123',
                user_id: 'user-123',
                resource: Resources.TASK,
                action: Actions.UPDATE,
                resource_id: 'task-123',
                field_changed: ['title'],
                old_value: ['Old Title'],
            }));
        });

        it('should throw 404 and not emit if task is not found', async () => {
            mockHistoryService.canManipulateRecords.mockResolvedValue([]);

            await expect(
                taskService.update('task-123', { title: 'New' } as any, 'project-123', 'user-123')
            ).rejects.toMatchObject({ statusCode: 404 });

            expect(mockEmit).not.toHaveBeenCalled();
        });
    });

    describe('changeStatus', () => {
        it('should change from open to in_progress and emit UPDATE record', async () => {
            mockRepository.getStatus.mockResolvedValue({ status: TicketStatus.OPEN } as any);
            mockRepository.updateStatus.mockResolvedValue({ affected: 1 } as any);

            await taskService.changeStatus('task-123', TicketStatus.IN_PROGRESS, 'project-123', 'user-123');

            expect(mockEmit).toHaveBeenCalledWith('record', expect.objectContaining({
                resource: Resources.TASK,
                action: Actions.UPDATE,
                field_changed: ['status'],
                old_value: [TicketStatus.OPEN],
                new_value: [TicketStatus.IN_PROGRESS],
            }));
        });

        it('should change from in_progress to pending and emit UPDATE record', async () => {
            mockRepository.getStatus.mockResolvedValue({ status: TicketStatus.IN_PROGRESS } as any);
            mockRepository.updateStatus.mockResolvedValue({ affected: 1 } as any);

            await taskService.changeStatus('task-123', TicketStatus.PENDING, 'project-123', 'user-123');

            expect(mockEmit).toHaveBeenCalledWith('record', expect.objectContaining({
                old_value: [TicketStatus.IN_PROGRESS],
                new_value: [TicketStatus.PENDING],
            }));
        });

        it('should throw 400 and not emit if the transition is not allowed', async () => {
            // open → resolved is not a valid transition
            mockRepository.getStatus.mockResolvedValue({ status: TicketStatus.OPEN } as any);

            await expect(
                taskService.changeStatus('task-123', TicketStatus.RESOLVED, 'project-123', 'user-123')
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(mockEmit).not.toHaveBeenCalled();
        });

        it('should throw 400 for closed → in_progress (not allowed)', async () => {
            mockRepository.getStatus.mockResolvedValue({ status: TicketStatus.CLOSED } as any);

            await expect(
                taskService.changeStatus('task-123', TicketStatus.IN_PROGRESS, 'project-123', 'user-123')
            ).rejects.toMatchObject({ statusCode: 400 });
        });

        it('should allow reopening a closed task (closed → open)', async () => {
            mockRepository.getStatus.mockResolvedValue({ status: TicketStatus.CLOSED } as any);
            mockRepository.updateStatus.mockResolvedValue({ affected: 1 } as any);

            await taskService.changeStatus('task-123', TicketStatus.OPEN, 'project-123', 'user-123');

            expect(mockEmit).toHaveBeenCalled();
        });
    });

    describe('drop', () => {
        it('should delete a task and emit a DELETE history record', async () => {
            mockHistoryService.canManipulateRecords.mockResolvedValue(['Test Task', 'desc', 'open', 'medium']);
            mockRepository.drop.mockResolvedValue({ affected: 1 } as any);

            await taskService.drop('task-123', 'project-123', 'user-123');

            expect(mockEmit).toHaveBeenCalledWith('record', expect.objectContaining({
                project_id: 'project-123',
                user_id: 'user-123',
                resource: Resources.TASK,
                action: Actions.DELETE,
                resource_id: 'task-123',
                old_value: ['Test Task', 'desc', 'open', 'medium'],
                new_value: [],
            }));
        });

        it('should throw 404 and not emit if task is not found', async () => {
            mockHistoryService.canManipulateRecords.mockResolvedValue([]);

            await expect(
                taskService.drop('task-123', 'project-123', 'user-123')
            ).rejects.toMatchObject({ statusCode: 404 });

            expect(mockEmit).not.toHaveBeenCalled();
        });
    });
});
