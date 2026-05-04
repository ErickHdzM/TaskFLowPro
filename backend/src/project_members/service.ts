import {
    getByUserId
} from './rerpository'

import { Roles } from './entity'

const permissions = {
    [Roles.OWNER]: {
        project: ['get','create','update','delete'],
        members: ['get','create','update','delete'],
        tasks:   ['get','create','update','delete'],
        comments:['get','create','update','delete'],
    },
    [Roles.ADMIN]: {
        project: ['get','update'],
        members: ['get','create','update'],
        tasks:   ['get','create','update','delete'],
        comments:['get','create','update'],
    },
    [Roles.EDITOR]: {
        project: ['get'],
        members: ['get'],
        tasks:   ['get','update'],
        comments:['get','create','update'],
    }
}

interface Action {
    resource: 'project' | 'members' | 'tasks' | 'comments';
    action: 'get' | 'create' | 'update' | 'delete';
}

export const match_permission = async (usr_id: string, prj_id: string, action: Action): Promise<boolean> => {
    const member = await getByUserId(prj_id, usr_id);
    if (!member) return false;

    const userRole = member.role;
    const rolePermissions = permissions[userRole];
    const allowedActions = rolePermissions[action.resource];

    return allowedActions.includes(action.action);
}

export const insert = async () => {
    
}

