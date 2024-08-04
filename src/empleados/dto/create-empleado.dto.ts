import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateEmpleadoDto {

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
    cargo: string;

    @IsOptional()
    @IsDateString()
    fecha_creacion?: Date;

    @IsOptional()
    @IsDateString()
    fecha_modificacion?: Date;
}
