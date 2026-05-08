import { historyEmitter } from '../history/emitter';
import { Actions, Resources } from '../history/entity';
import { canManipulateRecords, toStringArray } from '../history/service';
import {
    insert as insertComment,
    drop as dropComment,
    getAuthor
} from './repository'

const resource = 'comments' as const;
const COMMENT_FIELDS = ['comment'];

export const insert = async(project_id:string, task_id:string, user_id:string, comment:string) => {
    const com = await insertComment({ task_id, author_id: user_id, comment });

    historyEmitter.emit('record', {
        project_id,
        user_id,
        resource: Resources.COMMENT,
        action: Actions.CREATE,
        resource_id: com.id,
        field_changed: COMMENT_FIELDS,
        old_value: [],
        new_value: toStringArray(COMMENT_FIELDS, com),
    });

    return com;
}

export const drop = async (id:string, user_id:string, project_id:string) => {
    const author = await getAuthor(id);
    if (!author) return null;
    if (user_id !== author) return null;

    const oldValues = await canManipulateRecords(resource, id, COMMENT_FIELDS);

    const res = await dropComment(id);

    historyEmitter.emit('record', {
        project_id,
        user_id,
        resource: Resources.COMMENT,
        action: Actions.DELETE,
        resource_id: id,
        field_changed: COMMENT_FIELDS,
        old_value: oldValues,
        new_value: [],
    });

    return res;
}