import { DataSource } from 'typeorm';
import { config } from './config';

import { User } from './users/entity';
import { RefreshToken } from './auth/entity';
import { Projects } from "./projects/entity";
import { ProjectMembers } from "./project_members/entity";
import { Tasks } from "./tasks/entity";
import { TaskComments } from "./task_comments/entity";
import { History } from "./history/entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.password,
    database: config.db.name,
    synchronize: config.node_env === 'development',
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

