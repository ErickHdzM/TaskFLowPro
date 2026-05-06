import { AppDataSource } from "../db";
import { Projects } from "./entity";
import { ProjectMembers, Roles } from '../project_members/entity';
export interface NewProject {
    owner_id:string;
    title:string;
    description?:string;
}

interface UpdateProject {
    title?:string;
    description?:string;
}

export async function insert(data:NewProject): Promise<Projects> {
    try{
        const repo = AppDataSource.getRepository(Projects);
        const project = repo.create(data);
        const ex = await repo.save(project);

        const members = AppDataSource.getRepository(ProjectMembers);
        const m_data = {
            user_id: data.owner_id,
            project_id: ex.id,
            role: Roles.OWNER
        }
        const member = members.create(m_data);
        await members.save(member);
        return ex
    }catch (err){
        throw err
    }
}

export async function selectAll(id:string): Promise<Projects[]>{
    return await AppDataSource
    .getRepository(Projects)
    .createQueryBuilder("p")
    .leftJoinAndSelect("p.members", "pm")
    .select([
        "p.id",
        "p.title",
        "p.description",
        "p.owner_id",
        "p.created_at",
        "p.updated_at"
    ])
    .where("(p.owner_id = :id OR pm.user_id = :id)", { id })
    .andWhere("p.is_deleted = :isDeleted", { isDeleted: false })
    .distinct(true)
    .getMany();
}

export async function select(usr_id:string, project_id:string): Promise<Projects | null>{
    return await AppDataSource
    .getRepository(Projects)
    .createQueryBuilder("p")
    .leftJoinAndSelect("p.members","pm")
    .leftJoinAndSelect("p.tasks","t")
    .select([
        "p.id",
        "p.title",
        "p.description",
        "p.owner_id",
        "p.created_at",
        "p.updated_at"
    ])
    .addSelect([
        "pm.id",
        "pm.user_id",
        "pm.role",
        "t.id",
        "t.title",
        "t.description",
        "t.status",
        "t.created_at",
        "t.updated_at"
    ])
    .where("(p.owner_id = :usr_id OR pm.user_id = :usr_id)",{ usr_id })
    .andWhere("p.id = :project_id", { project_id })
    .andWhere("p.is_deleted = :isDeleted", { isDeleted: false })
    .getOne()
}

export async function update(id:string, data:UpdateProject) {
    return await AppDataSource
    .createQueryBuilder()
    .update(Projects)
    .set(data)
    .where("id = :id", {id})
    .execute()
}

export async function drop(project_id:string, usr_id:string ) {
    return await AppDataSource
    .createQueryBuilder()
    .update(Projects)
    .set({ is_deleted: true })
    .where("id = :project_id", { project_id })
    .andWhere(
        "(owner_id = :usr_id OR id IN (SELECT project_id FROM project_members WHERE user_id = :usr_id))",
        { usr_id }
    )
    .execute()
}

