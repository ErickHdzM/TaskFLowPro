import {
    getByUserId,
    insert as insertMember,
    list as listMembers,
    update as updateMember,
    drop as dropMember
} from './rerpository'

import { CreateMemberDTO } from './dto';
import { Roles } from './entity';

const permissions = {
    [Roles.OWNER]: {
        project: ['get','create','update','delete'],
        members: ['get','create','update','delete'],
        tasks:   ['get','create','update','delete','change_status'],
        comments:['get','create','update','delete'],
    },
    [Roles.ADMIN]: {
        project: ['get','update'],
        members: ['get','create','update'],
        tasks:   ['get','create','update','delete','change_status'],
        comments:['get','create','update'],
    },
    [Roles.EDITOR]: {
        project: ['get'],
        members: ['get'],
        tasks:   ['get','update','change_status'],
        comments:['get','create','update'],
    }
}

interface Action {
    resource: 'project' | 'members' | 'tasks' | 'comments';
    action: 'get' | 'create' | 'update' | 'delete' | 'change_status';
}

export const match_permission = async (usr_id: string, prj_id: string, action: Action): Promise<boolean> => {
    const member = await getByUserId(prj_id, usr_id);
    if (!member) return false;

    const userRole = member.role;
    const rolePermissions = permissions[userRole];
    const allowedActions = rolePermissions[action.resource];

    return allowedActions.includes(action.action);
}

export const insert = async (data:CreateMemberDTO) => {

    const isAlredy = await getByUserId(data.project_id,data.user_id);
    if (isAlredy) throw new Error('This user is alredy in the project');

    return await insertMember(data);
}

export const list = async (prj_id:string) => {
    return await listMembers(prj_id);
}

export const update = async (id:string, role:Roles) => {
    return await updateMember(id, role);
}

export const drop = async (id:string) => {
    const res = await dropMember(id);
    if (res.affected === 0) throw new Error('Data not found')
}
