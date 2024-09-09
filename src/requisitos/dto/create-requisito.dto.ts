import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRequisitoDto {

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    nombre: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    tipo: string;

    @IsOptional()
    @IsBoolean()
    predeterminado: boolean;
}
