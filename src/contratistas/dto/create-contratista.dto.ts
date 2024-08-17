import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateContratistaDto {

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @Transform(({ value }) => value?.toUpperCase())
    nombre: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @Transform(({ value }) => value?.toUpperCase())
    apellidos?: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    tipo: string;

    @IsOptional()
    @IsDateString()
    fecha_creacion?: Date;

    @IsOptional()
    @IsDateString()
    fecha_modificacion?: Date;
}

export class ContratistaSearchDto {

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    nombre: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    tipo: string
}
