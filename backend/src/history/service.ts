import {
    insert as insertRecord,
    query as queryRecords,
    getGenericOldValues,
    IsIdExist,
    QueryFilters
} from './repository'

import { CreateHistoryDTO } from './dto';
import { historyEmitter } from './emitter';
import { Actions, Resources } from './entity';

import { Projects } from "../projects/entity";
import { Tasks } from "../tasks/entity";
import { TaskComments } from "../task_comments/entity";
import { ProjectMembers } from "../project_members/entity";

const translate = {
    'projects': Projects,
    'tasks': Tasks,
    'members': ProjectMembers,
    'comments': TaskComments
}

const insert = async (data:CreateHistoryDTO) => {
    await insertRecord(data);
}

const getOldValues = async (resource: any, id:string, fields: string[]) => {
    return await getGenericOldValues(resource, id, fields);
}

const toStringValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

export const toStringArray = (fields:string[], data:any) => {
    return fields.map(field => toStringValue((data as Record<string, unknown>)[field]));
}

export const canManipulateRecords = async (table: keyof typeof translate, id: string, fields: string[]): Promise<string[]> => {
    const resource = translate[table];
    const isExist = await IsIdExist(resource, id);
    if (!isExist) return [];

    const record = await getOldValues(resource, id, fields);
    if (!record) return [];

    return fields.map(field => toStringValue((record as Record<string, unknown>)[field]));
}

historyEmitter.on('record', async (data) => {
    try{
        await insert(data);
    }catch (err){
        console.error('[HISTORY] failed to record', err);
    } 
});

export type { QueryFilters };

export const get = async (filters: QueryFilters) => {
    return await queryRecords(filters);
}
