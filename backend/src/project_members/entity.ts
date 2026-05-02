import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany, 
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm"

import { User } from "../users/entity";
import { Projects } from "../projects/entity";

export enum Roles {
    OWNER  = "owner",
    ADMIN  = "admin",
    EDITOR = "editor",
}

@Entity("project_members")
export class ProjectMembers {

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name:'user_id' })
    user!: User;
    @Column()
    user_id!: string;

    @ManyToOne(() => Projects)
    @JoinColumn({ name: 'project_id' })
    project!: Projects
    @Column()
    project_id!:string

    @Column({ type: 'enum', enum: Roles, default: Roles.EDITOR })
    role!: Roles;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

}