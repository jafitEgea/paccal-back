import { PartialType } from '@nestjs/swagger';
import { CreateContratistaDto } from './create-contratista.dto';

export class UpdateContratistaDto extends PartialType(CreateContratistaDto) {}
