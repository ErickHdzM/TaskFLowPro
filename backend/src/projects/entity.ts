import { 
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
    OneToMany
} from "typeorm";

import { User } from "../users/entity";
import { ProjectMembers } from "../project_members/entity";
import { Tasks } from "../tasks/entity";

@Entity("projects")
@Index(["owner_id"])
export class Projects{

    @PrimaryGeneratedColumn("uuid")
    id!:string;

    @ManyToOne(() => User)
    @JoinColumn({ name:'owner_id' })
    owner!:User;

    @Column()
    owner_id!: string

    @Column({type:'varchar', length:255, nullable:false})
    title!: string

    @Column({type:"text", nullable:true})
    description?: string

    @CreateDateColumn()
    created_at!:Date

    @UpdateDateColumn()
    updated_at!: Date

    @Column({type:"boolean", default:false})
    is_deleted?:boolean

    @OneToMany(() => ProjectMembers, (member) => member.project)
    members?: ProjectMembers[]

    @OneToMany(() => Tasks, (task) => task.project)
    tasks?: Tasks[]

}

