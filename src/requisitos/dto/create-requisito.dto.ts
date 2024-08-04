import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRequisitoDto {

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    nombre: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    tipo: string;
}
