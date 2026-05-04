import { AppDataSource } from "../db";
import { ProjectMembers, Roles } from './entity'

import { CreateMemberDTO } from './dto';

export const insert = async (data:CreateMemberDTO) => {
    const repo = AppDataSource.getRepository(ProjectMembers);
    const member = repo.create(data);
    return await repo.save(member);
}

export const list = async (prj_id:string) => {
    return await AppDataSource
    .getRepository(ProjectMembers)
    .createQueryBuilder("pm")
    .where('project_id = :prj_id',{ prj_id })
    .getMany()
}

export const getByUserId = async (prj_id:string, usr_id:string) => {
    return await AppDataSource
    .getRepository(ProjectMembers)
    .createQueryBuilder("pm")
    .select([
        'pm.id',
        'pm.user_id',
        'pm.role'
    ])
    .where("pm.project_id = :prj_id", { prj_id })
    .andWhere("pm.user_id = :usr_id", { usr_id })
    .getOne()
}

export const update = async (id:string, role:Roles) => {
    return await AppDataSource
    .createQueryBuilder()
    .update(ProjectMembers)
    .set({role: role})
    .where('id = :id', { id })
    .execute()
}

export const drop = async (id:string) => {
    return await AppDataSource
    .getRepository(ProjectMembers)
    .createQueryBuilder("pm")
    .delete()
    .where('id = :id', { id })
    .execute()
}