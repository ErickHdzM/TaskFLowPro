import { selectAll } from "./repository";


export const list = async (id:string) => {
    if (!id){
        return null;
    }

    const projects = await selectAll(id);

    if (!projects){
        return null
    }

    

}