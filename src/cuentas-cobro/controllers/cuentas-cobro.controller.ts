import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Constants } from 'src/assets/environment/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ContratosService } from 'src/contratos/services/contratos.service';
import { EmpleadosService } from 'src/empleados/services/empleados.service';
import { RequisitosService } from 'src/requisitos/services/requisitos.service';
import { RevisionesService } from 'src/revisiones/services/revisiones.service';
import { UsuariosService } from 'src/usuarios/services/usuarios.service';
import { CreateCuentasCobroDto, CuentaCobroSearch } from '../dto/create-cuentas-cobro.dto';
import { UpdateCuentasCobroDto } from '../dto/update-cuentas-cobro.dto';
import { CuentasCobroService } from '../services/cuentas-cobro.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Cuentas-Cobro')
@Controller('cuentas-cobro')
export class CuentasCobroController {
  constructor(private readonly cuentasCobroService: CuentasCobroService,
    private readonly contratosService: ContratosService,
    private readonly usuariosService: UsuariosService,
    private readonly empleadosService: EmpleadosService,
    private readonly requisitosService: RequisitosService,
    private readonly revisionesService: RevisionesService
  ) { }

  @Get()
  async getAllAccountsReceivable() {
    try {
      const data = await this.cuentasCobroService.findAll();
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Cuentas de cobro encontradas exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get(':tipo')
  async getAllAccountsReceivableByType(@Param('tipo') tipo: string) {
    try {
      const data = await this.cuentasCobroService.findAllByType(tipo);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Cuentas de cobro encontradas exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get('id/:id')
  async getAccountReceivable(@Param('id') id: number) {
    try {
      const data = await this.cuentasCobroService.findOne(+id);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Cuenta(s) de cobro encontrada(s) exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('buscar/:tipo')
  @ApiBody({ type: CuentaCobroSearch })
  async getAccountsReceivableByParams(@Body() body: CuentaCobroSearch, @Param('tipo') tipo: string) {
    try {
      const data = await this.cuentasCobroService.findByParams(body, tipo);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Cuenta(s) de cobro encontrada(s) exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('/verify')
  @ApiBody({ type: CreateCuentasCobroDto })
  async accountReceivableExists(@Body() body: UpdateCuentasCobroDto) {
    try {
      if (!(await this.contratosService.contractExistsById(body.id_contrato))) {
        throw new BadRequestException("Contrato no encontrado");
      }
      if (!(await this.empleadosService.employeeExistsById(body.id_aprobador))) {
        throw new BadRequestException("Empleado Aprobador no encontrado");
      }
      if (!(await this.usuariosService.userExistsById(body.id_revisor))) {
        throw new BadRequestException("Usuario Revisor no encontrado");
      }
      if (body.requisitos) {
        for (let item of body.requisitos) {
          if (!(await this.requisitosService.requirementExistsById(item.id_requisito)))
            throw new BadRequestException(`Requisito con id ${item.id_requisito} no encontrado`)
        }
      }

      return await this.cuentasCobroService.accountReceivableExists(body);

    } catch (error) { throw error }
  }

  @Post('/verify-for-update')
  @ApiBody({ type: CreateCuentasCobroDto })
  async accountReceivableExistsForUpdate(@Body() body: UpdateCuentasCobroDto) {
    try {
      if (!(await this.contratosService.contractExistsById(body.id_contrato))) {
        throw new BadRequestException("Contrato no encontrado");
      }
      if (!(await this.empleadosService.employeeExistsById(body.id_aprobador))) {
        throw new BadRequestException("Empleado Aprobador no encontrado");
      }
      if (!(await this.usuariosService.userExistsById(body.id_revisor))) {
        throw new BadRequestException("Usuario Revisor no encontrado");
      }
      if (body.requisitos) {
        for (let item of body.requisitos) {
          if (!(await this.requisitosService.requirementExistsById(item.id_requisito)))
            throw new BadRequestException(`Requisito con id ${item.id_requisito} no encontrado`)
        }
      }

      return await this.cuentasCobroService.accountReceivableExistsForUpdate(body);

    } catch (error) { throw error }
  }

  @Post()
  async createAccountReceivable(@Body() body: CreateCuentasCobroDto) {
    try {
      if (!(await this.contratosService.contractExistsById(body.id_contrato))) {
        throw new BadRequestException("Contrato no encontrado");
      }
      if (!(await this.empleadosService.employeeExistsById(body.id_aprobador))) {
        throw new BadRequestException("Empleado Aprobador no encontrado");
      }
      if (!(await this.usuariosService.userExistsById(body.id_revisor))) {
        throw new BadRequestException("Usuario Revisor no encontrado");
      }
      if (body.requisitos) {
        for (let item of body.requisitos) {
          if (!(await this.requisitosService.requirementExistsById(item.id_requisito)))
            throw new BadRequestException(`Requisito con id ${item.id_requisito} no encontrado`)
        }
      }
      if (await this.cuentasCobroService.accountReceivableExists(body)) {
        throw new BadRequestException("Cuenta de cobro ya existente");
      }
      const data = await this.cuentasCobroService.create(body);
      return {
        success: true,
        action: Constants.INSERT,
        data,
        message: 'Cuenta de cobro creada exitosamente',
      };

    } catch (error) { throw error }
  }

  @Put(':id')
  @ApiBody({ type: CreateCuentasCobroDto })
  async updateAccountReceivable(@Param('id') id: number, @Body() body: UpdateCuentasCobroDto) {
    try {
      if (!(await this.cuentasCobroService.accountReceivableExistsById(+id))) {
        throw new BadRequestException("Cuenta de cobro no encontrada");
      }
      if (!(await this.contratosService.contractExistsById(body.id_contrato))) {
        throw new BadRequestException("Contrato no encontrado");
      }
      if (!(await this.empleadosService.employeeExistsById(body.id_aprobador))) {
        throw new BadRequestException("Empleado Aprobador no encontrado");
      }
      if (!(await this.usuariosService.userExistsById(body.id_revisor))) {
        throw new BadRequestException("Usuario Revisor no encontrado");
      }
      if (body.requisitos) {
        for (let item of body.requisitos) {
          if (!(await this.requisitosService.requirementExistsById(item.id_requisito)))
            throw new BadRequestException(`Requisito con id ${item.id_requisito} no encontrado`)
        }
      }
      // if( await this.cuentasCobroService.accountReceivableExistsForUpdate(body) ) {
      //   throw new BadRequestException("Cuenta de cobro ya existente");
      // }
      const data = await this.cuentasCobroService.update(+id, body);
      return {
        success: true,
        action: Constants.UPDATE,
        data,
        message: 'Cuenta de cobro actualizada exitosamente',
      };
    } catch (error) { throw error }
  }

  @Delete(':id')
  async DeleteAccountReceivable(@Param('id') id: number) {
    try {
      if (!(await this.cuentasCobroService.accountReceivableExistsById(+id))) {
        throw new BadRequestException("Cuenta de cobro no encontrado");
      }
      const data = this.cuentasCobroService.delete(id);
      this.revisionesService.deleteByIdAccountReceivable(id);
      return {
        success: true,
        action: Constants.DELETE,
        data,
        message: 'Cuenta de cobro eliminada exitosamente',
      };
    } catch (error) { throw error }
  }
}
