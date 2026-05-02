import { AppDataSource } from "../db";
import { Projects } from "./entity";

interface NewProject {
    owner_id:string;
    title:string;
    description?:string;
}

interface UpdateProject {
    title?:string;
    description?:string;
}


export async function insert(data:NewProject): Promise<Projects> {
    const repo = AppDataSource.getRepository(Projects);
    const project = repo.create(data);
    return await repo.save(project);
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

export async function select(usr_id:string, project_id:string): Promise<Projects[]>{
    return await AppDataSource
    .getRepository(Projects)
    .createQueryBuilder("p")
    .leftJoin("p.members","pm")
    .innerJoinAndSelect("p.tasks","t")
    .where("(p.owner_id = :usr_id OR pm.user_id = :usr_id)",{ usr_id })
    .andWhere("p.id = :project_id", { project_id })
    .andWhere("p.is_deleted = :isDeleted", { isDeleted: false })
    .getMany()
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
    await AppDataSource
    .getRepository(Projects)
    .createQueryBuilder("p")
    .leftJoin("p.members","pm")
    .update({ is_deleted: true})
    .where("p.id = :project_id", { project_id: project_id })
    .andWhere("(p.owner_id = :usr_id OR pm.user_id = :usr_id)",{ usr_id })
    .execute()
}

