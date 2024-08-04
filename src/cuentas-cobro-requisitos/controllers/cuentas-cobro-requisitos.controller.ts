import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Constants } from 'src/assets/environment/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CuentasCobroService } from 'src/cuentas-cobro/services/cuentas-cobro.service';
import { RequisitosService } from 'src/requisitos/services/requisitos.service';
import { CreateCuentasCobroRequisitoDto } from '../dto/create-cuentas-cobro-requisito.dto';
import { UpdateCuentasCobroRequisitoDto } from '../dto/update-cuentas-cobro-requisito.dto';
import { CuentasCobroRequisitosService } from '../services/cuentas-cobro-requisitos.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Cuentas-Cobro-Requisitos')
@Controller('cuentas-cobro-requisitos')
export class CuentasCobroRequisitosController {
  constructor(private readonly cuentasCobroRequisitosService: CuentasCobroRequisitosService,
              private readonly cuentasCobroService: CuentasCobroService,
              private readonly requisitosService: RequisitosService,
  ) {}

  @Get()
  async findAll() {
    try {
      const data = await this.cuentasCobroRequisitosService.findAll();
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Requisitos de cuentas de cobro encontrados exitosamente',
      };
    } catch (error) {
      return { 
          success: false,
          action: Constants.SELECT,
          message: error.message
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      const data = await this.cuentasCobroRequisitosService.findOne(+id);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Requisitos de la cuenta de cobro encontrados exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('/by-cuentacobro-requisito')
  @ApiBody({ type: CreateCuentasCobroRequisitoDto })
  async findByIdContractAndIdRequirement(@Body() body: UpdateCuentasCobroRequisitoDto) {
    if( !( await this.cuentasCobroService.accountReceivableExistsById(body.id_cuentacobro) ) ){
      throw new BadRequestException("Cuenta de cobro no encontrada");
    }
    if( !( await this.requisitosService.requirementExistsById(body.id_requisito) ) ){
      throw new BadRequestException("Requisito no encontrado");
    }
    return await this.cuentasCobroRequisitosService.findByIdContratoYIdRequisito(body);
  }

  @Post('/verify')
  @ApiBody({ type: CreateCuentasCobroRequisitoDto })
  async cuentaCobrorequirementExists(@Body() body: UpdateCuentasCobroRequisitoDto) {
    if( !( await this.cuentasCobroService.accountReceivableExistsById(body.id_cuentacobro) ) ){
      throw new BadRequestException("Cuenta de cobro no encontrada");
    }
    if( !( await this.requisitosService.requirementExistsById(body.id_requisito) ) ){
      throw new BadRequestException("Requisito no encontrado");
    }
    return await this.cuentasCobroRequisitosService.cuentaCobrorequirementExists(body);
  }

  @Post()
  async create(@Body() body: CreateCuentasCobroRequisitoDto[]) {
    return this.cuentasCobroRequisitosService.create(body);
  }

  @Put(':id')
  async update(@Body() body: UpdateCuentasCobroRequisitoDto[]) {
    return this.cuentasCobroRequisitosService.update(body);
  }

  @Delete(':id')
  async delete(@Param('id') id_cuentacobro: number) {
    return this.cuentasCobroRequisitosService.delete(+id_cuentacobro);
  }
}
