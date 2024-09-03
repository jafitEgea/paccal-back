import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Constants } from 'src/assets/environment/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ContratistaSearchDto, CreateContratistaDto } from '../dto/create-contratista.dto';
import { UpdateContratistaDto } from '../dto/update-contratista.dto';
import { ContratistasService } from '../services/contratistas.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Contratistas')
@Controller('contratistas')
export class ContratistasController {
  constructor(private readonly contratistasService: ContratistasService) { }

  @Get()
  async getAllContractors() {
    try {
      const data = await this.contratistasService.findAll();
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contratistas encontrados exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        action: Constants.SELECT,
        message: error.message
      };
    }
  }

  @Get('all/:type')
  async getAllContractorsByType(@Param('type') type: string) {
    try {
      const data = await this.contratistasService.findAllByType(type);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contratistas encontrados exitosamente',
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
  async getContractor(@Param('id') id: number) {
    try {
      const data = await this.contratistasService.findOne(+id);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contratista encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get('nombre/:nombre')
  async getContractorByName(@Param('nombre') name: string) {
    try {
      const data = await this.contratistasService.findOneByName(name);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contratista encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('nombre/nombre-tipo')
  @ApiBody({ type: ContratistaSearchDto })
  async getContractorByNameAndType(@Body() body: ContratistaSearchDto) {
    try {
      const data = await this.contratistasService.findOneByNameAndType(body);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contratista encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get('nombres/:nombre')
  async getContractorsNamesByName(@Param('nombre') name: string) {
    try {
      const data = await this.contratistasService.findNamesByName(name);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contratista encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('nombres/nombre-tipo')
  async getContractorsNamesByNameAndType(@Body() body: ContratistaSearchDto) {
    try {
      const data = await this.contratistasService.findNamesByNameAndType(body);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contratistas encontrados exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('/verify')
  @ApiBody({ type: CreateContratistaDto })
  async contractorExists(@Body() body: UpdateContratistaDto) {
    return await this.contratistasService.contractorExists(body);
  }

  @Post()
  async createContractor(@Body() body: CreateContratistaDto) {
    try {
      if (await this.contratistasService.contractorExists(body)) {
        throw new BadRequestException("Contratista ya existente");
      }
      const data = await this.contratistasService.create(body);
      return {
        success: true,
        action: Constants.INSERT,
        data,
        message: 'Contratista creado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Put(':id')
  @ApiBody({ type: CreateContratistaDto })
  async updateContractor(@Param('id') id: number, @Body() body: UpdateContratistaDto) {
    try {
      if (!(await this.contratistasService.contractorExistsById(+id))) {
        throw new BadRequestException("Contratista no encontrado");
      }
      if (await this.contratistasService.contractorExists(body)) {
        throw new BadRequestException("Contratista ya existente");
      }
      const data = await this.contratistasService.update(+id, body);
      return {
        success: true,
        action: Constants.UPDATE,
        data,
        message: 'Contratista actualizado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Delete(':id')
  async deleteContractor(@Param('id') id: number) {
    try {
      if (!(await this.contratistasService.contractorExistsById(+id))) {
        throw new BadRequestException("Contratista no encontrado");
      }
      const data = await this.contratistasService.delete(+id);
      return {
        success: true,
        action: Constants.DELETE,
        data,
        message: 'Contratista eliminado exitosamente',
      };
    } catch (error) {
      if (String(error).includes("related records")) {
        const msg = "Existen registros relacionados a este elemento"
        throw new BadRequestException(msg);
      }
      throw error;
    }
  }
}
