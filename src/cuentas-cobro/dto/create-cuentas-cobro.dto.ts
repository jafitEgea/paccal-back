import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";
import { CreateCuentasCobroRequisitoDto } from "src/cuentas-cobro-requisitos/dto/create-cuentas-cobro-requisito.dto";

export class CreateCuentasCobroDto {

    @IsPositive()
    @IsNotEmpty()
    id_contrato: number;

    @IsPositive()
    @IsNotEmpty()
    id_aprobador: number;

    @IsDateString()
    @IsOptional()
    fecha_aprobacion?: Date;

    @IsPositive()
    @IsNotEmpty()
    id_revisor: number;

    @IsDateString()
    @IsOptional()
    fecha_revision?: Date;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsString()
    @IsNotEmpty()
    oficina_receptora: string;

    @IsDateString()
    @IsNotEmpty()
    fecha_inicial: Date;

    @IsDateString()
    @IsNotEmpty()
    fecha_final: Date;

    @IsString()
    @IsOptional()
    periodo?: string;

    @IsString()
    @IsOptional()
    url?: string;

    @IsArray()
    requisitos: CreateCuentasCobroRequisitoDto[];

}