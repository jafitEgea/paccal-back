import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUsuarioDto {

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @Transform(({ value }) => value?.toUpperCase())
    nombres: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @Transform(({ value }) => value?.toUpperCase())
    apellidos: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    nombre_usuario: string;

    @IsOptional()
    @IsString()
    contraseña: string;

    @IsNotEmpty()
    @IsString()
    rol: string;

    @IsOptional()
    @IsDateString()
    fecha_creacion?: Date;

    @IsOptional()
    @IsDateString()
    fecha_modificacion?: Date;

}

export class UserNameDto {

    @IsNotEmpty()
    @IsString()
    nombre_usuario: string;
}

export class FullNameDto {

    @IsNotEmpty()
    @IsString()
    nombre_completo: string;
}

export class UserSearchDto {

    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    nombre_usuario?: string;
}

export class LoginDto {

    @IsNotEmpty()
    @IsString()
    nombre_usuario: string;

    @IsNotEmpty()
    @IsString()
    contraseña: string;
}
