import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Constants } from 'src/assets/environment/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuditoriaSearch, CreateAuditoriaDto } from '../dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from '../dto/update-auditoria.dto';
import { AuditoriaService } from '../services/auditoria.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Auditoria')
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) { }

  @Get()
  async GetAllTracks() {
    try {
      const data = await this.auditoriaService.findAll();
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Pistas de auditoría encontradas exitosamente',
      };
    } catch (error) { throw error }
  }

  @Get(':id')
  async getOneTrack(@Param('id') id: number) {
    try {
      const data = await this.auditoriaService.findOne(+id);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Pista de auditoría encontrada exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post('buscar')
  @ApiBody({ type: AuditoriaSearch })
  async getTracksByParams(@Body() body: AuditoriaSearch) {
    try {
      const data = await this.auditoriaService.findByParams(body);
      return {
        success: true,
        action: Constants.SELECT,
        data,
        message: 'Pista de auditoría encontrada exitosamente',
      };
    } catch (error) { throw error }
  }

  @Post()
  createTrack(@Body() body: CreateAuditoriaDto) {
    try {
      const data = this.auditoriaService.create(body);
      return {
        success: true,
        action: Constants.INSERT,
        data,
        message: 'Pista de auditoria creada exitosamente',
      };
    } catch (error) { throw error }
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() body: UpdateAuditoriaDto) {
    return this.auditoriaService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.auditoriaService.remove(+id);
  }
}
