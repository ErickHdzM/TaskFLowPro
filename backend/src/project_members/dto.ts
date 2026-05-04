import {
    IsUUID,
    IsEnum
} from 'class-validator'

import { Roles } from './entity'

export class CreateMemberDTO {
    @IsUUID()
    user_id!: string;

    @IsUUID()
    project_id!:string;

    @IsEnum(Roles)
    role!:Roles

}
