import { RefreshToken } from "./entity";
import { User } from "../users/entity";
import { AppDataSource } from "../db";

export const search_credentials = async (email:string) => {
    const usr = await AppDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select(["user.id","user.email","user.username","user.password_hash"])
    .where("user.email = :email",{email})
    .andWhere("user.is_active = :flag", {flag:true})
    .getOne()

    if (!usr){
        return null;
    }

    return usr
}

export const saveRefreshToken = async (userId:string, token:string) => {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await AppDataSource
    .getRepository(RefreshToken)
    .createQueryBuilder("refresh_token")
    .insert()
    .into(RefreshToken)
    .values([
        {user_id:userId, token:token, expires_at:expiresAt}
    ])
    .execute()
}



export const isRefreshTokenValid = async (userId:string, token:string) => {

    const result = await AppDataSource
    .getRepository(RefreshToken)
    .createQueryBuilder("refresh_token")
    .where("user_id = :userId", {userId})
    .andWhere("token = :token", {token})
    .andWhere("expires_at > NOW()")
    .getMany();

    return result.length > 0;

}