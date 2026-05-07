import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToMany,
} from "typeorm";

import { Projects } from "../projects/entity";
import { ProjectMembers } from "../project_members/entity";
import { History } from "../history/entity";

@Entity("users")
@Index(["oauth_provider", "oauth_id"], { unique: true })
export class User {

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 255, unique: true, nullable: true })
    username!: string | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    password_hash!: string | null;

    @Column({ type: "varchar", length: 50, nullable: true })
    oauth_provider!: string | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    oauth_id!: string | null;

    @Column({ type: "text", nullable: true })
    oauth_access_token!: string | null;

    @Column({ type: "text", nullable: true })
    oauth_refresh_token!: string | null;

    @Column({ type: "varchar", length: 100, nullable: true })
    first_name!: string | null;

    @Column({ type: "varchar", length: 100, nullable: true })
    last_name!: string | null;

    @Column({ type: "boolean", default: false })
    email_verified!: boolean;

    @Column({ type: "boolean", default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column({ type: "timestamp", nullable: true })
    last_login_at!: Date | null;

    @OneToMany(() => Projects, (projects) => projects.owner)
    projects?: Projects[]

    @OneToMany(() => ProjectMembers, (member) => member.user)
    projectMembers?: ProjectMembers[]

    @OneToMany(() => History, (h) => h.user )
    historyRecord?: History[]

}
