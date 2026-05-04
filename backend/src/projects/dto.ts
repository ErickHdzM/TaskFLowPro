import { 
    IsString,
    IsOptional
 } from "class-validator";

export class CreateProjectDTO {

    @IsString()
    title!: string;

    @IsString()
    @IsOptional()
    description?: string;

}

export class UpdateProjectDTO {
    @IsOptional()
    @IsString()
    title?:string;

    @IsOptional()
    @IsString()
    description?:string;
}
