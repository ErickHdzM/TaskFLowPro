import { TaskComments } from './entity';
import { AppDataSource } from '../db';

interface dataComment {

    task_id: string;
    author_id: string;
    comment: string;

}

export const insert = async (data: dataComment) => {
    const repo = AppDataSource.getRepository(TaskComments);
    const comment = repo.create(data);
    return await repo.save(comment);
}

export const getAuthor = async (id: string) => {
    const data = await AppDataSource
    .getRepository(TaskComments)
    .createQueryBuilder('c')
    .select(['c.author_id'])
    .where('c.id = :id', { id })
    .getOne();
    return data?.author_id;
}

export const drop = async (id:string) => {
    return await AppDataSource
    .getRepository(TaskComments)
    .createQueryBuilder('c')
    .delete()
    .where('id = :id',{ id })
    .execute()
}
