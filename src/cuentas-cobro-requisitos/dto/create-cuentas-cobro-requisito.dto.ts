import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateCuentasCobroRequisitoDto {

    @IsNotEmpty()
    @IsNumber()
    id_cuentacobro: number;

    @IsNotEmpty()
    @IsNumber()
    id_requisito: number;

    @IsNotEmpty()
    @IsNumber()
    marcado: number;

}
