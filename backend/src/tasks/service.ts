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
import { AppError } from '../middleware/errorHandler';

const stateMachine: Record< TicketStatus, TicketStatus[] > = {

    open: [ TicketStatus.IN_PROGRESS, TicketStatus.CLOSED ],
    'in progress': [ TicketStatus.PENDING, TicketStatus.CLOSED ],
    pending: [ TicketStatus.RESOLVED, TicketStatus.IN_PROGRESS ],
    resolved: [ TicketStatus.CLOSED, TicketStatus.IN_PROGRESS ],
    closed: [ TicketStatus.OPEN ]

}

export const insert = async (data:any): Promise<Tasks> => {
    const res = await insertTask(data);
    if (!res){
        throw new Error('Unexpected error');
    }
    return res;
}

export const get = async (id:string) => {
    return await getTask(id);
}

export const list = async (prj_id:string) => {
    return await listTasks(prj_id);
}

export const update = async (id:string, data:UpdateTaskDTO) => {
    return await updateTask(id, data);
}

export const changeStatus = async (id:string, status:TicketStatus) => {
    const res = await getStatus(id);
    const actualStatus = res?.status as TicketStatus;
    const allowedActions = stateMachine[actualStatus];
    
    if (!allowedActions.includes(status)){
        throw new Error('El status invalido')
    }

    const resUpdate = await updateStatus(id, status);

    return resUpdate;
}

export const drop = async (id:string) => {
    return await dropTask(id);
}