import { Response } from "express";
import { AppError } from '../middleware/errorHandler';
import { CreateProjectDTO, UpdateProjectDTO } from "./dto";
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { 
    create as createProject, 
    list as listProjects, 
    get as getProject,
    update as updateProject,
    drop as dropProject
} from "./service";
import { requireAuth } from "../middleware/requireAuth";
import { AuthRequest } from "../middleware/requireAuth";

export const create = requireAuth(async (req: AuthRequest, res: Response) => {
    const dto = plainToInstance(CreateProjectDTO, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
        throw new AppError(400, 'Invalid project data');
    }

    const project = await createProject({
        owner_id: req.user!.id,
        title: dto.title,
        description: dto.description
    });
    res.status(201).json(project);
});

export const list = requireAuth(async (req: AuthRequest, res: Response) => {
    const projects = await listProjects(req.user!.id);
    res.status(200).json(projects);
});

export const get = requireAuth(async (req: AuthRequest, res:Response) => {
    const id = req.params?.project_id;
    if (!id) throw new AppError(400, 'Missing information');
    const project = await getProject({ project_id: id as string, usr_id: req.user!.id });
    res.status(200).json({response: project})

});

export const update = requireAuth(async (req: AuthRequest, res: Response) => {
    const dto = plainToInstance(UpdateProjectDTO, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
        throw new AppError(400, 'Invalid project data');
    }
    const id = req.params?.project_id
    if (!id) throw new AppError(400, 'Missing Information');
    const project = await updateProject(id as string, dto);
    if (!project) throw new AppError(500, 'Error updating the project')
    res.status(200).json({new_data: project});
});

export const drop = requireAuth(async (req: AuthRequest, res: Response) => {
    const id = req.params?.project_id;
    if (!id) throw new AppError(400, 'Missing Information');
    try{
        await dropProject(id as string, req.user?.id as string);
    }catch (err){
        throw new AppError(500, 'Error deleting the project')
    }

});
