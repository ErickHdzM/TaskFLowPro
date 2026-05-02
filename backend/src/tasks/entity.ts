import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";

import { Projects } from "../projects/entity";

export enum TicketStatus {
    OPEN        = "open",
    IN_PROGRESS = "in progress",
    PENDING     = 'pending',
    RESOLVED    = 'resolved',
    CLOSED      = 'closed'
}

export enum TicketPriority {
    PLANNING    = 'planning',
    LOW         = 'low',
    MEDIUM      = 'medium',
    HIGH        = 'high',
    CRITICAL    = 'critical'
}

@Entity("tasks")
export class Tasks {
    
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Projects)
    @JoinColumn({ name: 'project_id' })
    project!: Projects;
    @Column()
    project_id!: string;

    @Column({ type: 'varchar', length:255, nullable: false })
    title!: string;

    @Column({ type: 'text', nullable:true })
    description?: string;

    @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
    status!: TicketStatus;

    @Column({ type:'enum', enum: TicketPriority, default: TicketPriority.PLANNING })
    priority!: TicketPriority

    @CreateDateColumn()
    created_at!: Date

    @UpdateDateColumn()
    updated_at!: Date;

}