import { PartialType } from '@nestjs/swagger';
import { CreateCuentasCobroDto } from './create-cuentas-cobro.dto';

export class UpdateCuentasCobroDto extends PartialType(CreateCuentasCobroDto) {}
