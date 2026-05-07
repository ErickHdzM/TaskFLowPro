import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from "typeorm";

import { Projects } from "../projects/entity";
import { User } from "../users/entity";


export enum Resources {
    PROJECT = 'projects',
    TASK = 'tasks',
    MEMBERS = 'members',
    COMMENT = 'comments',
}

export enum Actions {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete'
}

@Entity("history")
@Index(['resource','action','project_id'])
export class History {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Projects)
    @JoinColumn({ name: 'project_id'})
    project!: Projects
    @Column()
    project_id!: string;

    @Column({ type: 'enum', enum: Resources })
    resource!: Resources;

    @Column()
    resource_id!: String;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: string;
    @Column()
    user_id!: string;

    @Column({ type: 'enum', enum: Actions })
    action!: Actions;;

    @Column("simple-array")
    field_changed!: string[];

    @Column("simple-array")
    old_value?: string[];

    @Column("simple-array")
    new_value?: string[];

    @CreateDateColumn()
    created_at!: Date;

}