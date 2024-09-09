import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateContratoDto {

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    num_contrato: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    objeto: string;

    @IsNotEmpty()
    @IsPositive()
    id_contratista: number;

    @IsOptional()
    @IsDateString()
    fecha_inicial: Date;

    @IsOptional()
    @IsDateString()
    fecha_final: Date;

    @IsOptional()
    @IsDateString()
    fecha_creacion?: Date;

    @IsOptional()
    @IsDateString()
    fecha_modificacion?: Date;

}

export class ContractSearchDto {

    @IsOptional()
    @IsString()
    num_contrato?: string;

    @IsOptional()
    @IsString()
    nombre_contratista?: string;

}
