import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Constants } from 'src/assets/environment/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateEmpleadoDto } from '../dto/create-empleado.dto';
import { UpdateEmpleadoDto } from '../dto/update-empleado.dto';
import { EmpleadosService } from '../services/empleados.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) { }

  @Get()
  async getAllEmployees() {
    try {
      const data = await this.empleadosService.findAll();
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Empleados encontrados exitosamente',
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
  async getEmployee(@Param('id') id: number) {
    try {
      const data = await this.empleadosService.findOne(+id);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Empleado encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get('nombre/:nombre')
  async getEmployeeByFullName(@Param('nombre') fullName: string) {
    try {
      const data = await this.empleadosService.findOneByFullName(fullName);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Empleado encontrado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('/verify')
  @ApiBody({ type: CreateEmpleadoDto })
  async employeeExists(@Body() body: UpdateEmpleadoDto) {
    return await this.empleadosService.employeeExists(body);
  }

  @Post()
  async createEmployee(@Body() body: CreateEmpleadoDto) {
    try {
      if (await this.empleadosService.employeeExists(body)) {
        throw new BadRequestException("Empleado ya existente");
      }
      const data = await this.empleadosService.create(body);
      return {
        success: true,
        action: Constants.INSERT,
        data,
        message: 'Empleado creado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Put(':id')
  @ApiBody({ type: CreateEmpleadoDto })
  async updateEmployee(@Param('id') id: number, @Body() body: UpdateEmpleadoDto) {
    try {
      if (!(await this.empleadosService.employeeExistsById(+id))) {
        throw new BadRequestException("Empleado no encontrado");
      }
      if (await this.empleadosService.employeeExists(body)) {
        throw new BadRequestException("Empleado ya existente");
      }
      const data = await this.empleadosService.update(+id, body);
      return {
        success: true,
        action: Constants.UPDATE,
        data,
        message: 'Empleado actualizado exitosamente',
      };
    } catch (error) { throw error }
  }

  @Delete(':id')
  async deleteEmployee(@Param('id') id: number) {
    try {
      if (!(await this.empleadosService.employeeExistsById(id))) {
        throw new BadRequestException("Empleado no encontrado");
      }
      const data = await this.empleadosService.delete(+id);
      return {
        success: true,
        action: Constants.DELETE,
        data,
        message: 'Empleado eliminado exitosamente',
      };
    } catch (error) { throw error }
  }
}
