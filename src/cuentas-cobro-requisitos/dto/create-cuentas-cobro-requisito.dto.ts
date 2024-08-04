import { IsNotEmpty, IsPositive } from "class-validator";

export class CreateCuentasCobroRequisitoDto {

    @IsPositive()
    @IsNotEmpty()
    id_cuentacobro: number;

    @IsPositive()
    @IsNotEmpty()
    id_requisito: number;

    @IsPositive()
    @IsNotEmpty()
    marcado: number;

}
