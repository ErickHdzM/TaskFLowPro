import bcrypt from "bcryptjs";
import { User } from "./entity";
import { get_all, create_user, getByEmail, get as getRepository } from "./repository";

export interface CreateUserDTO {
    email: string;
    username?: string;
    password: string;
    first_name?: string;
    last_name?: string;
}

export interface UserResponseDTO {
    id: string;
    email: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    email_verified: boolean;
    created_at: Date;
}

function toResponse(user: User): UserResponseDTO {
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email_verified: user.email_verified,
        created_at: user.created_at,
    };
}

export async function getAll(): Promise<UserResponseDTO[]> {
    const users = await get_all();
    return users.map(toResponse);
}

export async function get(id: string): Promise<UserResponseDTO>{
    console.log("seraching for a user...")
    const user = await getRepository(id);
    if (!user){
        throw new Error("User not found")
    } 
    const res : UserResponseDTO = toResponse(user);
    return res;
}

export async function createUser(dto: CreateUserDTO): Promise<UserResponseDTO> {
    const existing = await getByEmail(dto.email);
    if (existing) {
        throw new Error("Email already in use");
    }

    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = await create_user({ ...dto, password_hash });
    return toResponse(user);
}
