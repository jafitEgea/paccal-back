import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Constants } from 'src/assets/environment/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ContratistasService } from 'src/contratistas/services/contratistas.service';
import { ContractSearchDto, CreateContratoDto } from '../dto/create-contrato.dto';
import { UpdateContratoDto } from '../dto/update-contrato.dto';
import { ContratosService } from '../services/contratos.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Contratos')
@Controller('contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService,
    private readonly contratistasService: ContratistasService
  ) { }

  @Get()
  async getAllContracts() {
    try {
      const data = await this.contratosService.findAll();
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contratos encontrados exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get(':id')
  async getContract(@Param('id') id: number) {
    try {
      const data = await this.contratosService.findOne(+id);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contratista encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get('num_contrato/:num_contrato')
  async getContractByNumContract(@Param('num_contrato') num_contrato: string) {
    try {
      const data = await this.contratosService.findOneByNumContract(num_contrato);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contratos encontrados exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get('contratista/:id')
  async getContractByIdContractor(@Param('id') id_contratista: number) {
    try {
      const data = await this.contratosService.findByIdContractor(id_contratista);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contrato encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get('contratista/reciente/:id')
  async getMostRecentContractByIdContractor(@Param('id') id_contratista: number) {
    try {
      const data = await this.contratosService.findMostRecentContractByIdContractor(id_contratista);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contrato encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get('contratista/nombre/:nombre')
  async getContractByNameContractor(@Param('nombre') nombre: string) {
    try {
      const data = await this.contratosService.findByNameContractor(nombre);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contrato encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('buscar')
  @ApiBody({ type: ContractSearchDto })
  async getContractByNumOrNameContractor(@Body() body: ContractSearchDto) {
    try {
      const data = await this.contratosService.findByNumOrNameContractor(body);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contrato encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('contratista-num')
  @ApiBody({ type: ContractSearchDto })
  async getContractsNumsByNumAndNameContractor(@Body() body: ContractSearchDto) {
    try {
      const data = await this.contratosService.findNumsByNumAndNameContractor(body);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Contrato encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('/verify')
  @ApiBody({ type: CreateContratoDto })
  async contractExists(@Body() body: UpdateContratoDto) {
    if (!(await this.contratistasService.contractorExistsById(body.id_contratista))) {
      throw new BadRequestException("Contratista no encontrado");
    }
    return await this.contratosService.contractExists(body);
  }

  @Post()
  async createContract(@Body() body: CreateContratoDto) {
    try {
      if (!(await this.contratistasService.contractorExistsById(body.id_contratista))) {
        throw new BadRequestException("Contratista no encontrado");
      }
      if (await this.contratosService.contractExistsByNum(body.num_contrato)) {
        throw new BadRequestException("Numero de contrato ya existente");
      }
      if (await this.contratosService.contractExists(body)) {
        throw new BadRequestException("Contrato ya existente");
      }
      const data = await this.contratosService.create(body);
      return {
        success: true,
        action: Constants.INSERT,
        data,
        message: 'Contrato creado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Put(':id')
  @ApiBody({ type: CreateContratoDto })
  async updateContract(@Param('id') id: number, @Body() body: UpdateContratoDto) {
    try {
      if (!(await this.contratosService.contractExistsById(+id))) {
        throw new BadRequestException("Contrato no encontrado");
      }
      if (!(await this.contratistasService.contractorExistsById(body.id_contratista))) {
        throw new BadRequestException("Contratista no encontrado");
      }
      if (!(await this.contratosService.createdContractExistsByNum(body.num_contrato, id)) && await this.contratosService.contractExistsByNum(body.num_contrato)) {
        throw new BadRequestException("No se puede escoger este número de contrato.");
      }
      if (await this.contratosService.contractExists(body)) {
        throw new BadRequestException("Contrato ya existente");
      }
      const data = await this.contratosService.update(+id, body);
      return {
        success: true,
        action: Constants.UPDATE,
        data,
        message: 'Contrato actualizado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Delete(':id')
  async deleteContract(@Param('id') id: number) {
    try {
      if (!(await this.contratosService.contractExistsById(+id))) {
        throw new BadRequestException("Contrato no encontrado");
      }
      const data = await this.contratosService.delete(+id);
      return {
        success: true,
        action: Constants.DELETE,
        data,
        message: 'Contrato eliminado exitosamente',
      };
    } catch (error) { throw error }
  }
}
