import { PartialType } from '@nestjs/swagger';
import { CreateRequisitoDto } from './create-requisito.dto';

export class UpdateRequisitoDto extends PartialType(CreateRequisitoDto) {}
