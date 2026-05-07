import { TicketPriority, TicketStatus, Tasks } from './entity';
import { CreateTaskDTO, UpdateTaskDTO } from './dto';
import {
    insert as insertTask,
    getById as getTask,
    getByProject as listTasks,
    update as updateTask,
    drop as dropTask,
    getStatus,
    updateStatus
} from './repository';
import { historyEmitter } from '../history/emitter';
import { canManipulateRecords, toStringArray } from '../history/service';
import { Actions, Resources } from '../history/entity';
import { AppError } from '../middleware/errorHandler';

const stateMachine: Record< TicketStatus, TicketStatus[] > = {

    open: [ TicketStatus.IN_PROGRESS, TicketStatus.CLOSED ],
    'in progress': [ TicketStatus.PENDING, TicketStatus.CLOSED ],
    pending: [ TicketStatus.RESOLVED, TicketStatus.IN_PROGRESS ],
    resolved: [ TicketStatus.CLOSED, TicketStatus.IN_PROGRESS ],
    closed: [ TicketStatus.OPEN ]

}
const resource = 'tasks';
const TASK_FIELDS = ['title', 'description', 'status', 'priority'];

export const insert = async (data: CreateTaskDTO & { project_id: string }, user_id: string): Promise<Tasks> => {
    const res = await insertTask(data);
    if (!res) throw new Error('Unexpected error');

    const fields = TASK_FIELDS.filter(k => (data as any)[k] !== undefined);
    historyEmitter.emit('record', {
        project_id: data.project_id,
        user_id,
        resource: Resources.TASK,
        action: Actions.CREATE,
        resource_id: res.id,
        field_changed: fields,
        old_value: [],
        new_value: toStringArray(fields, res),
    });

    return res;
}

export const get = async (id:string) => {
    return await getTask(id);
}

export const list = async (prj_id:string) => {
    return await listTasks(prj_id);
}

export const update = async (id: string, data: UpdateTaskDTO, project_id: string, user_id: string) => {
    const fields = Object.keys(data).filter(k => (data as any)[k] !== undefined);
    const oldValues = await canManipulateRecords(resource, id, fields);
    if (!oldValues.length) throw new AppError(404, 'Task not found');

    const res = await updateTask(id, data);

    historyEmitter.emit('record', {
        project_id,
        user_id,
        resource: Resources.TASK,
        action: Actions.UPDATE,
        resource_id: id,
        field_changed: fields,
        old_value: oldValues,
        new_value: toStringArray(fields, data),
    });

    return res;
}

export const changeStatus = async (id: string, status: TicketStatus, project_id: string, user_id: string) => {
    const res = await getStatus(id);
    const actualStatus = res?.status as TicketStatus;
    const allowedActions = stateMachine[actualStatus];

    if (!allowedActions.includes(status)) throw new AppError(400, 'El status invalido');

    const resUpdate = await updateStatus(id, status);

    historyEmitter.emit('record', {
        project_id,
        user_id,
        resource: Resources.TASK,
        action: Actions.UPDATE,
        resource_id: id,
        field_changed: ['status'],
        old_value: [actualStatus],
        new_value: [status],
    });

    return resUpdate;
}

export const drop = async (id: string, project_id: string, user_id: string) => {
    const oldValues = await canManipulateRecords(resource, id, TASK_FIELDS);
    if (!oldValues.length) throw new AppError(404, 'Task not found');

    const res = await dropTask(id);

    historyEmitter.emit('record', {
        project_id,
        user_id,
        resource: Resources.TASK,
        action: Actions.DELETE,
        resource_id: id,
        field_changed: TASK_FIELDS,
        old_value: oldValues,
        new_value: [],
    });

    return res;
}