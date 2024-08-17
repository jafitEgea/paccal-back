import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateRevisionDto {

    @IsNotEmpty()
    @IsNumber()
    id_cuentacobro: number;

    @IsNotEmpty()
    @IsPositive()
    id_autor: number;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    descripcion: string;

    @IsOptional()
    @IsDateString()
    fecha_creacion?: Date;

    @IsOptional()
    @IsDateString()
    fecha_modificacion?: Date;
}

export class RevisionSearchDto {

    @IsOptional()
    @IsPositive()
    id_cuentacobro?: number;

    @IsOptional()
    @IsString()
    nombre_autor?: string;
}