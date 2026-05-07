import {
    insert as insertComment,
    drop as dropComment,
    getAuthor
} from './repository'

export const insert = async(task_id:string ,usr_id:string, comment:string) => {
    const com = await insertComment({ task_id: task_id, author_id: usr_id, comment: comment });
    return com
}

export const drop = async (id:string, usr_id:string) => {
    const author = await getAuthor(id);
    if (!author){
        return null
    }
    if (usr_id !== author){
        return null;
    }

    return await dropComment(id);
}