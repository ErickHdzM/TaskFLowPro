import {
    IsUUID,
    IsEnum,
    IsOptional
} from 'class-validator'

import { Roles } from './entity'

export class CreateMemberDTO {
    @IsUUID()
    user_id!: string;

    @IsUUID()
    project_id!:string;

    @IsOptional()
    @IsEnum(Roles)
    role!:Roles

}
