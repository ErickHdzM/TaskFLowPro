import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from "typeorm";

import { User } from "../users/entity";

@Entity("refresh_token")
@Index(["user_id"])
export class RefreshToken{

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name:'user_id' })
    user!: User;

    @Column({type:"varchar", nullable: true})
    user_id?: string;

    @Column({type:"text",nullable:false})
    token!: string

    @Column({type:"timestamp",nullable:false})
    expires_at!: Date

    @CreateDateColumn()
    created_at!: Date

}