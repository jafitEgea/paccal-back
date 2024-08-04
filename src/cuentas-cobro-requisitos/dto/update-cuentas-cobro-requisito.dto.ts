import { PartialType } from '@nestjs/swagger';
import { CreateCuentasCobroRequisitoDto } from './create-cuentas-cobro-requisito.dto';

export class UpdateCuentasCobroRequisitoDto extends PartialType(CreateCuentasCobroRequisitoDto) {}
