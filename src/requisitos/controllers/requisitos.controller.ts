import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Constants } from 'src/assets/environment/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateRequisitoDto } from '../dto/create-requisito.dto';
import { UpdateRequisitoDto } from '../dto/update-requisito.dto';
import { RequisitosService } from '../services/requisitos.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Requisitos')
@Controller('requisitos')
export class RequisitosController {
  constructor(private readonly requisitosService: RequisitosService) { }

  @Get()
  async getAllRequirements() {
    try {
      const data = await this.requisitosService.findAll();
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Requisitos encontrados exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get(':id')
  async getRequirement(@Param('id') id: number) {
    try {
      const data = await this.requisitosService.findOne(+id);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Requisito encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get('tipo/:tipo')
  async getRequirementsByType(@Param('tipo') tipo: string) {
    try {
      const data = await this.requisitosService.findByType(tipo);

      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Requisitos encontrados exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get('nombre/:nombre')
  async getRequirementByName(@Param('nombre') nombre: string) {
    try {
      const data = await this.requisitosService.findOneByName(nombre);

      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Requisito(s) encontrado(s) exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('/verify')
  @ApiBody({ type: CreateRequisitoDto })
  async requirementExists(@Body() body: UpdateRequisitoDto) {
    return await this.requisitosService.requirementExists(body);
  }

  @Post()
  async createRequirement(@Body() body: CreateRequisitoDto) {
    try {
      if (await this.requisitosService.requirementExists(body)) {
        throw new BadRequestException("Requisito ya existente");
      }
      const data = await this.requisitosService.create(body);
      return {
        success: true,
        action: Constants.INSERT,
        data,
        message: 'Requisito creado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Put(':id')
  async updateRequirement(@Param('id') id: number, @Body() body: UpdateRequisitoDto) {
    try {
      if (!(await this.requisitosService.requirementExistsById(+id))) {
        throw new BadRequestException("Requisito no encontrado");
      }
      if (await this.requisitosService.requirementExists(body)) {
        throw new BadRequestException("Requisito ya existente");
      }
      const data = await this.requisitosService.update(+id, body);
      return {
        success: true,
        action: Constants.UPDATE,
        data,
        message: 'Requisito actualizado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Delete(':id')
  async deleteRequirement(@Param('id') id: number) {
    try {
      if (!(await this.requisitosService.requirementExistsById(+id))) {
        throw new BadRequestException("Requisito no encontrado");
      }
      const data = await this.requisitosService.delete(+id);
      return {
        success: true,
        action: Constants.DELETE,
        data,
        message: 'Requisito eliminado exitosamente',
      };
    } catch (error) {
      if (String(error).includes("related records")) {
        const msg = "Existen registros relacionados a este elemento";
        throw new BadRequestException(msg);
      }
    }

  }
}

