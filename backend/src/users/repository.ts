import { User } from "./entity";
import { AppDataSource } from "../db";

export async function get_all(){
    return await AppDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.is_active = :status", {status:true})
    .getMany(); 
}

export async function get(userId: string) {
    return await AppDataSource
        .getRepository(User)
        .createQueryBuilder("user")
        .where("user.id = :userId", { userId })
        .andWhere("user.is_active = :usrStatus", {usrStatus:true})
        .getOne();
}

export async function getByEmail(email: string) {
    return await AppDataSource
        .getRepository(User)
        .createQueryBuilder("user")
        .where("user.email = :email", { email })
        .andWhere("user.is_active = :usrStatus", {usrStatus:true})
        .getOne();
}

interface NewUser {
    email: string;
    username?: string;
    password_hash: string;
    first_name?: string;
    last_name?: string;
}

export async function create_user(data: NewUser): Promise<User> {
    const repo = AppDataSource.getRepository(User);
    const user = repo.create(data);
    return await repo.save(user);
}