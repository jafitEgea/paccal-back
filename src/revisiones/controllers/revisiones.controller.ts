import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Constants } from 'src/assets/environment/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CuentasCobroService } from 'src/cuentas-cobro/services/cuentas-cobro.service';
import { UsuariosService } from 'src/usuarios/services/usuarios.service';
import { CreateRevisionDto, RevisionSearchDto } from '../dto/create-revision.dto';
import { UpdateRevisionDto } from '../dto/update-revision.dto';
import { RevisionesService } from '../services/revisiones.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Revisiones')
@Controller('revisiones')
export class RevisionesController {

    constructor(
        private readonly revisionesService: RevisionesService,
        private readonly cuentasCobroService: CuentasCobroService,
        private readonly usuariosService: UsuariosService,
    ) { }

    @Get()
    async getAllReviews() {
        try {
            const data = await this.revisionesService.findAll();
            return {
                success: true,
                action: Constants.SELECT,
                data,
                message: 'Revisiones encontradas exitosamente',
            };
        } catch (error) { throw error }
    }

    @Get(':id')
    async getReview(@Param('id') id: number) {
        try {
            const data = await this.revisionesService.findOne(+id);
            return {
                success: true,
                action: Constants.SELECT,
                data,
                message: 'Revision encontrada exitosamente',
            };
        } catch (error) { throw error }
    }

    @Get('cuenta-cobro/:id_cuentacobro')
    async getReviewByAccountReceivable(@Param('id_cuentacobro') id_cuentacobro: number) {
        try {
            const data = await this.revisionesService.findOneByAccountReceivable(+id_cuentacobro);
            return {
                success: true,
                action: Constants.SELECT,
                data,
                message: 'Revision(es) encontrada(s) exitosamente',
            };
        } catch (error) { throw error }
    }

    @Post('buscar')
    async getReviewByAccountReceivableOrAuthor(@Body() body: RevisionSearchDto) {
        try {
            const data = await this.revisionesService.findOneByAccountReceivableOrAuthor(body);
            return {
                success: true,
                action: Constants.SELECT,
                data,
                message: 'Revision(es) encontrada(s) exitosamente',
            };
        } catch (error) { throw error }
    }

    @Post('/verify')
    @ApiBody({ type: CreateRevisionDto })
    async reviewExists(@Body() body: UpdateRevisionDto) {
        if (!(await this.cuentasCobroService.accountReceivableExistsById(body.id_cuentacobro))) {
            throw new BadRequestException("Cuenta de cobro no encontrada");
        }
        return await this.revisionesService.reviewExists(body);
    }

    @Post()
    async createReview(@Body() body: CreateRevisionDto) {
        try {
            if (!(await this.cuentasCobroService.accountReceivableExistsById(body.id_cuentacobro))) {
                throw new BadRequestException("Cuenta de cobro no encontrada");
            }
            if (!(await this.usuariosService.userExistsById(body.id_autor))) {
                throw new BadRequestException("Usuario autor no encontrado");
            }
            if (await this.revisionesService.reviewExists(body)) {
                throw new BadRequestException("Revision ya existente");
            }
            const data = await this.revisionesService.create(body);
            return {
                success: true,
                action: Constants.INSERT,
                data,
                message: 'Revision creada exitosamente',
            };
        } catch (error) { throw error }
    }

    @Put(':id')
    @ApiBody({ type: CreateRevisionDto })
    async updateReview(@Param('id') id: number, @Body() body: UpdateRevisionDto) {
        try {
            if (!(await this.revisionesService.reviewExistsById(+id))) {
                throw new BadRequestException("Revision no encontrada");
            }
            if (!(await this.cuentasCobroService.accountReceivableExistsById(body.id_cuentacobro))) {
                throw new BadRequestException("Cuenta de cobro no encontrada");
            }
            if (!(await this.usuariosService.userExistsById(body.id_autor))) {
                throw new BadRequestException("Usuario autor no encontrado");
            }
            if (await this.revisionesService.reviewExists(body)) {
                throw new BadRequestException("Revision ya existente");
            }
            const data = await this.revisionesService.update(+id, body);
            return {
                success: true,
                action: Constants.UPDATE,
                data,
                message: 'Revision actualizada exitosamente',
            };
        } catch (error) { throw error }
    }

    @Delete(':id')
    async deleteReview(@Param('id') id: number) {
        try {
            if (!(await this.revisionesService.reviewExistsById(+id))) {
                throw new BadRequestException("Revision no encontrada");
            }
            const data = await this.revisionesService.delete(+id);
            return {
                success: true,
                action: Constants.DELETE,
                data,
                message: 'Revision eliminada exitosamente',
            };
        } catch (error) { throw error }
    }

    @Delete('cuenta-cobro/:id')
    async deleteReviewByIdAccountReceivable(@Param('id') id: number) {
        try {
            // if (!(await this.cuentasCobroService.accountReceivableExistsById(id))) {
            //     throw new BadRequestException("Cuenta de cobro no encontrada");
            // }
            const data = await this.revisionesService.deleteByIdAccountReceivable(+id);
            return {
                success: true,
                action: Constants.DELETE,
                data,
                message: 'Revision eliminada exitosamente',
            };
        } catch (error) { throw error }
    }

}
