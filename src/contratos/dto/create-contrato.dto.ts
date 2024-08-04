import { IsDateString, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateContratoDto {

    @IsNotEmpty()
    @IsString()
    num_contrato: string;

    @IsNotEmpty()
    @IsString()
    objeto: string;

    @IsNotEmpty()
    @IsPositive()
    id_contratista: number;

    @IsNotEmpty()
    @IsDateString()
    fecha_inicial: Date;

    @IsNotEmpty()
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
