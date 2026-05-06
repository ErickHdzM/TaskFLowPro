import {
    IsString,
    IsUUID,
    IsEnum,
    IsOptional
} from 'class-validator';

import { TicketStatus, TicketPriority } from './entity';

export class CreateTaskDTO {

    @IsString()
    title!: string;

    @IsString()
    @IsOptional()
    description?:string;

    @IsOptional()
    @IsEnum(TicketStatus)
    status!: TicketStatus

    @IsOptional()
    @IsEnum(TicketPriority)
    priority!:TicketPriority

}

export class UpdateTaskDTO {

    @IsOptional()
    @IsString()
    title!: string;

    @IsString()
    @IsOptional()
    description?:string;

    @IsEnum(TicketPriority)
    @IsOptional()
    priority!:TicketPriority
    
}

export class ChangeStatusDTO {
    @IsEnum(TicketStatus)
    status!: TicketStatus
}
