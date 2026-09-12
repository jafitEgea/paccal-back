import { Transform, Type } from "class-transformer";
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { CreateCuentasCobroRequisitoDto } from "src/cuentas-cobro-requisitos/dto/create-cuentas-cobro-requisito.dto";

export class CreateCuentasCobroDto {

    @IsNotEmpty()
    @IsPositive()
    id_contrato: number;

    @IsNotEmpty()
    @IsPositive()
    id_aprobador: number;

    @IsOptional()
    @IsDateString()
    fecha_aprobacion?: Date;

    @IsNotEmpty()
    @IsPositive()
    id_revisor: number;

    @IsOptional()
    @IsString()
    observaciones?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    oficina_receptora?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @Transform(({ value }) => value?.toUpperCase())
    nombre_receptor?: string;

    @IsOptional()
    @IsDateString()
    fecha_recibido?: Date;

    @IsOptional()
    @IsDateString()
    fecha_inicial?: Date;

    @IsOptional()
    @IsDateString()
    fecha_final?: Date;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @Transform(({ value }) => value?.toUpperCase())
    periodo?: string;

    @IsOptional()
    @IsString()
    url?: string;

    @IsOptional()
    @IsDateString()
    fecha_creacion?: Date;

    @IsOptional()
    @IsDateString()
    fecha_modificacion?: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCuentasCobroRequisitoDto)
    requisitos: CreateCuentasCobroRequisitoDto[];
}

export class CuentaCobroSearch {

    @IsOptional()
    @IsNumber()
    id_cuentacobro?: number;

    @IsOptional()
    @IsString()
    nombre_contratista?: string;

    @IsOptional()
    @IsString()
    num_contrato?: string;

    @IsOptional()
    @IsString()
    nombre_revisor?: string;

}