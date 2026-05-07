import { DataSource } from 'typeorm';

import { User } from './users/entity';
import { RefreshToken } from './auth/entity';
import { Projects } from "./projects/entity";
import { ProjectMembers } from "./project_members/entity";
import { Tasks } from "./tasks/entity";
import { TaskComments } from "./task_comments/entity";
import { History } from "./history/entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.NODE_ENV === 'development',
    entities: [
        User, 
        RefreshToken, 
        Projects, 
        ProjectMembers,
        Tasks,
        TaskComments,
        History
    ],
});


async function init() {
    
    try{
        await AppDataSource.initialize()
        console.log("Data Source has been initialized");
    }catch (err){
        console.error("Error during Data Source initialization", err);
        throw err;
    }
}

export default {init};

