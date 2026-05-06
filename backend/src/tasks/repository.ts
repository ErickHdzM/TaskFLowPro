import { Tasks, TicketStatus } from "./entity";
import { AppDataSource } from "../db";
import { CreateTaskDTO, UpdateTaskDTO } from "./dto";
import { select } from "../projects/repository";

export const insert = async (data:CreateTaskDTO): Promise<Tasks> => {
    const repo = AppDataSource.getRepository(Tasks);
    const task = repo.create(data);
    return await repo.save(task);
}

export const getById = async (id:string): Promise<Tasks | null> => {
    return await AppDataSource
    .getRepository(Tasks)
    .createQueryBuilder('t')
    .leftJoinAndSelect('t.comments','tc')
    .select([
        't.id',
        't.title',
        't.description',
        't.status',
        't.priority'
    ])
    .addSelect([
        'tc.id',
        'tc.author_id',
        'tc.comment'
    ])
    .where('t.id = :id', { id })
    .getOne()
} 

export const getStatus = async (id:string) => {
    return await AppDataSource
    .getRepository(Tasks)
    .createQueryBuilder('t')
    .select(['t.status'])
    .where('id = :id', { id })
    .getOne()
}

export const getByProject = async (prj_id:string): Promise< Tasks[] > => {
    return await AppDataSource
    .getRepository(Tasks)
    .createQueryBuilder('t')
    .where('project_id = :prj_id', { prj_id })
    .getMany()
}

export const update = async (id:string, data:UpdateTaskDTO) => {
    return await AppDataSource
    .createQueryBuilder()
    .update(Tasks)
    .set(data)
    .where('id = :id', { id })
    .execute()
}

export const updateStatus = async (id:string, status: TicketStatus ) => {
    return await AppDataSource
    .createQueryBuilder()
    .update(Tasks)
    .set({ status: status })
    .where('id = :id', { id })
    .execute()
}

export const drop = async ( id:string ) => {
    return await AppDataSource
    .getRepository(Tasks)
    .createQueryBuilder('t')
    .delete()
    .where('id = :id', { id })
    .execute()
}