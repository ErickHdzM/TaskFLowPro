import { 
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    JoinColumn,
    ManyToOne,
    Column
} from "typeorm";

import { Tasks } from "../tasks/entity";
import { User } from "../users/entity";

@Entity('task_comments')
export class TaskComments {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Tasks)
    @JoinColumn({ name: 'task_id' })
    task!: string;
    @Column()
    task_id!:string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'author_id' })
    user!: string;
    @Column()
    author_id!: string;

    @Column({ type: 'text', nullable:false })
    comment!: string;

    @CreateDateColumn()
    created_at!: Date;

}