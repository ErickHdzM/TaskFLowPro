import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";

import { Tasks } from "../tasks/entity";

@Entity("task_history")
export class TaskHistory {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Tasks)
    @JoinColumn({ name: 'task_id' })
    task!: Tasks;

    @Column()
    task_id!: string;

    @Column({ type: 'varchar', length: 255 })
    field_changed!: string;

    @Column({ type: 'text', nullable: true })
    old_value?: string;

    @Column({ type: 'text', nullable: true })
    new_value?: string;

    @CreateDateColumn()
    created_at!: Date;

}