import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAuditoriaDto {

    @IsNotEmpty()
    @IsNumber()
    id_usuario: number;

    @IsString()
    @Transform(({ value }) => value?.trim())
    @Transform(({ value }) => value?.toUpperCase())
    nombre_usuario: string;

    @IsOptional()
    @IsDateString()
    fecha?: Date;

    @IsNotEmpty()
    @IsString()
    accion: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    descripcion: string;
}

export class AuditoriaSearch {

    @IsOptional()
    @IsNumber()
    id_usuario?: number;

    @IsOptional()
    @IsString()
    nombre_usuario?: string;

    @IsOptional()
    @IsDateString()
    fecha?: Date;

}