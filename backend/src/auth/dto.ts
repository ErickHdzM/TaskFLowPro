import {
    IsEmail,
    IsStrongPassword,
    IsString,
    IsOptional
} from 'class-validator';

export class CreateUserDTO {
    @IsEmail()
    email!: string;

    @IsString()
    @IsOptional()
    username?: string;

    @IsStrongPassword()
    password!: string;

    @IsOptional()
    @IsString()
    first_name?:string;

    @IsOptional()
    @IsString()
    last_name?:string;
}

export class LoginDTO {
    
    @IsEmail()
    email!: string;

    @IsString()
    password!: string;

}