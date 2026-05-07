import { 
    IsString,
    IsOptional,
    IsUUID,
    IsEnum,
    IsArray
} from "class-validator";

import { Resources, Actions } from './entity';

export class CreateHistoryDTO {

    @IsUUID()
    project_id!: string;

    @IsEnum(Resources)
    resource!: Resources;

    @IsUUID()
    resource_id!: string;

    @IsEnum(Actions)
    action!: Actions;

    @IsOptional()
    @IsArray()
    field_changed!: string[];

    @IsOptional()
    @IsArray()
    old_value!: string[];

    @IsOptional()
    @IsArray()
    new_value!: string[];

}
