import { UpdateProjectDTO } from "./dto";
import { selectAll, select, insert, NewProject, 
    update as updateProject,
    drop as dropProject
} from "./repository";

export const list = async (id:string) => {
    if (!id) return null;
    return await selectAll(id);
}

interface ids {
    project_id: string;
    usr_id: string;
}

export const get = async (data:ids) => {
    if (!data?.project_id || !data?.usr_id) return null;
    return await select(data.usr_id, data.project_id);
}

export const create = async (data:NewProject) => {
    if (!data) return null
    return await insert(data);
} 

export const update = async (id:string, data: UpdateProjectDTO) => {
    return await updateProject(id, data)
}

export const drop = async (id:string,usr_id:string) => {
    try{
        return await dropProject(id,usr_id);
    }catch (err){
        throw err;
    }
}
