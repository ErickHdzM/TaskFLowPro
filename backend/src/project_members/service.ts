import {
    getByUserId,
    insert as insertMember,
    list as listMembers,
    update as updateMember,
    drop as dropMember
} from './rerpository'

import { CreateMemberDTO } from './dto';
import { Roles } from './entity';
import { historyEmitter } from '../history/emitter';
import { Actions, Resources } from '../history/entity';
import { canManipulateRecords, toStringArray } from '../history/service';
import { AppError } from '../middleware/errorHandler';

const resource = 'members' as const;
const MEMBER_FIELDS = ['user_id', 'role'];

const permissions = {
    [Roles.OWNER]: {
        project: ['get','create','update','delete'],
        members: ['get','create','update','delete'],
        tasks:   ['get','create','update','delete','change_status'],
        comments:['get','create','update','delete'],
        history: ['get']
    },
    [Roles.ADMIN]: {
        project: ['get','update'],
        members: ['get','create','update'],
        tasks:   ['get','create','update','delete','change_status'],
        comments:['get','create','update','delete'],
        history: ['get']
    },
    [Roles.EDITOR]: {
        project: ['get'],
        members: ['get'],
        tasks:   ['get','update','change_status'],
        comments:['get','create','update','delete'],
        history: ['get']
    }
}

interface Action {
    resource: 'project' | 'members' | 'tasks' | 'comments' | 'history';
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

export const insert = async (data: CreateMemberDTO, user_id: string) => {
    const isAlready = await getByUserId(data.project_id, data.user_id);
    if (isAlready) throw new Error('This user is already in the project');

    const res = await insertMember(data);

    historyEmitter.emit('record', {
        project_id: data.project_id,
        user_id,
        resource: Resources.MEMBERS,
        action: Actions.CREATE,
        resource_id: res.id,
        field_changed: MEMBER_FIELDS,
        old_value: [],
        new_value: toStringArray(MEMBER_FIELDS, res),
    });

    return res;
}

export const list = async (prj_id: string) => {
    return await listMembers(prj_id);
}

export const update = async (id: string, role: Roles, project_id: string, user_id: string) => {
    const oldValues = await canManipulateRecords(resource, id, ['role']);
    if (!oldValues.length) throw new AppError(404, 'Member not found');

    const res = await updateMember(id, role);

    historyEmitter.emit('record', {
        project_id,
        user_id,
        resource: Resources.MEMBERS,
        action: Actions.UPDATE,
        resource_id: id,
        field_changed: ['role'],
        old_value: oldValues,
        new_value: [role],
    });

    return res;
}

export const drop = async (id: string, project_id: string, user_id: string) => {
    const oldValues = await canManipulateRecords(resource, id, MEMBER_FIELDS);
    if (!oldValues.length) throw new AppError(404, 'Member not found');

    await dropMember(id);

    historyEmitter.emit('record', {
        project_id,
        user_id,
        resource: Resources.MEMBERS,
        action: Actions.DELETE,
        resource_id: id,
        field_changed: MEMBER_FIELDS,
        old_value: oldValues,
        new_value: [],
    });
}
