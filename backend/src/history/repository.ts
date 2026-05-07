import { AppDataSource } from "../db";
import { CreateHistoryDTO } from "./dto";
import { History } from "./entity";

import { Resources, Actions } from "./entity";

export const insert = async (data: CreateHistoryDTO) => {
    const repo = AppDataSource.getRepository(History);
    const history = repo.create(data);
    await repo.save(history);
}

export interface QueryFilters {
    project_id: string;
    resource?: Resources;
    action?: Actions;
}

export const query = async (filters: QueryFilters) => {
    const qb = AppDataSource
        .getRepository(History)
        .createQueryBuilder('h')
        .where('h.project_id = :project_id', { project_id: filters.project_id });

    if (filters.resource) qb.andWhere('h.resource = :resource', { resource: filters.resource });
    if (filters.action)   qb.andWhere('h.action = :action',     { action: filters.action });

    return qb.getMany();
}

export const getGenericOldValues = async (table: any, id: string, fields: string[]) => {
    return await AppDataSource
        .getRepository(table)
        .createQueryBuilder('t')
        .select(fields.map(f => `t.${f}`))
        .where('t.id = :id', { id })
        .getOne()
}

export const IsIdExist = async (table:any, id:string) => {
    return await AppDataSource
    .getRepository(table)
    .createQueryBuilder('t')
    .where('t.id = :id',{id})
    .getExists()
}