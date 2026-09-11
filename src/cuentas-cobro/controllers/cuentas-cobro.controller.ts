/**
 * ============================================================================
 * CUENTAS COBRO CONTROLLER — DECORATOR + CHAIN OF RESPONSIBILITY (GoF)
 * ============================================================================
 *
 * PATRÓN 3: DECORATOR (Estructural)
 * ─────────────────────────────────
 * ANTES: Cada endpoint GET tenía lógica de validación de resultado vacío:
 *   @Get()
 *   async findAll() {
 *     const result = await this.cuentasCobroService.findAll();
 *     if (JSON.stringify(result) == '[]') {
 *       throw new NotFoundException("Cuentas de cobro no encontradas");
 *     }
 *     return result;
 *   }
 *   → Repetido en 4 endpoints; el controlador mezclaba HTTP con validación.
 *
 * DESPUÉS: Se aplica @UseInterceptors(new ThrowIfNotFoundInterceptor(msg))
 *   sobre el método del controlador. El interceptor envuelve la ejecución
 *   y lanza NotFoundException si el resultado está vacío.
 *   → Sin tocar la firma ni el cuerpo del método.
 *
 * PATRÓN 5: CHAIN OF RESPONSIBILITY (Comportamiento)
 * ───────────────────────────────────────────────────
 * ANTES: El controlador inyectaba 4 servicios y repetía validaciones:
 *   constructor(
 *     private readonly contratosService: ContratosService,
 *     private readonly empleadosService: EmpleadosService,
 *     private readonly usuariosService: UsuariosService,
 *     private readonly requisitosService: RequisitosService,
 *   ) {}
 *   → Mezclaba HTTP con reglas de negocio; acoplamiento excesivo.
 *
 * DESPUÉS: El controlador solo conoce la cadena:
 *   await this.validationChain.validate(body);
 *   → Un solo método ejecuta 4 validaciones encadenadas.
 *   → Agregar validación = nuevo eslabón (OCP).
 * ============================================================================
 */

import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { RevisionesService } from 'src/revisiones/services/revisiones.service';
import { CreateCuentasCobroDto, CuentaCobroSearch } from '../dto/create-cuentas-cobro.dto';
import { UpdateCuentasCobroDto } from '../dto/update-cuentas-cobro.dto';
import { CuentasCobroService } from '../services/cuentas-cobro.service';
import { CuentasCobroValidationChain } from '../validations/cuentas-cobro-validation-chain';
import { ThrowIfNotFoundInterceptor } from 'src/common/filters/throw-if-not-found.interceptor';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Cuentas-Cobro')
@Controller('cuentas-cobro')
export class CuentasCobroController {
  constructor(
    private readonly cuentasCobroService: CuentasCobroService,
    private readonly revisionesService: RevisionesService,
    private readonly validationChain: CuentasCobroValidationChain,  // ← CHAIN: solo 1 dependencia
  ) { }

  /**
   * DECORATOR: @UseInterceptors(new ThrowIfNotFoundInterceptor(msg))
   * Envuelve la ejecución y lanza 404 si el resultado está vacío.
   */
  @Get()
  @ResponseMessage('Cuentas de cobro encontradas exitosamente')
  @UseInterceptors(new ThrowIfNotFoundInterceptor('Cuenta(s) de cobro no encontrada(s)'))
  async getAllAccountsReceivable() {
    return await this.cuentasCobroService.findAll();
  }

  @Get(':tipo')
  @ResponseMessage('Cuentas de cobro encontradas exitosamente')
  @UseInterceptors(new ThrowIfNotFoundInterceptor('Cuenta(s) de cobro no encontrada(s)'))
  async getAllAccountsReceivableByType(@Param('tipo') tipo: string) {
    return await this.cuentasCobroService.findAllByType(tipo);
  }

  @Get('id/:id')
  @ResponseMessage('Cuenta de cobro encontrada exitosamente')
  @UseInterceptors(new ThrowIfNotFoundInterceptor('Cuenta de cobro no encontrada'))
  async getAccountReceivable(@Param('id') id: number) {
    return await this.cuentasCobroService.findOne(+id);
  }

  @Post('buscar/:tipo')
  @ResponseMessage('Cuenta(s) de cobro encontrada(s) exitosamente')
  @ApiBody({ type: CuentaCobroSearch })
  @UseInterceptors(new ThrowIfNotFoundInterceptor('Cuenta(s) de cobro no encontrada(s)'))
  async getAccountsReceivableByParams(@Body() body: CuentaCobroSearch, @Param('tipo') tipo: string) {
    return await this.cuentasCobroService.findByParams(body, tipo);
  }

  /**
   * CHAIN: Un solo método ejecuta 4 validaciones encadenadas.
   * Si alguna falla, lanza BadRequestException y se detiene.
   */
  @Post('/verify')
  @ApiBody({ type: CreateCuentasCobroDto })
  async accountReceivableExists(@Body() body: UpdateCuentasCobroDto) {
    await this.validationChain.validate(body);  // ← CHAIN: ejecuta toda la cadena

    return await this.cuentasCobroService.accountReceivableExists(body);
  }

  @Post('/verify-for-update')
  @ApiBody({ type: CreateCuentasCobroDto })
  async accountReceivableExistsForUpdate(@Body() body: UpdateCuentasCobroDto) {
    await this.validationChain.validate(body);  // ← CHAIN: reutiliza la misma cadena

    return await this.cuentasCobroService.accountReceivableExistsForUpdate(body);
  }

  @Post()
  @ResponseMessage('Cuenta de cobro creada exitosamente')
  async createAccountReceivable(@Body() body: CreateCuentasCobroDto) {
    await this.validationChain.validate(body);  // ← CHAIN: reutiliza la misma cadena

    return await this.cuentasCobroService.create(body);
  }

  @Put(':id')
  @ResponseMessage('Cuenta de cobro actualizada exitosamente')
  @ApiBody({ type: CreateCuentasCobroDto })
  async updateAccountReceivable(@Param('id') id: number, @Body() body: UpdateCuentasCobroDto) {

    if (!(await this.cuentasCobroService.accountReceivableExistsById(+id))) {
      throw new BadRequestException("Cuenta de cobro no encontrada");
    }

    await this.validationChain.validate(body);  // ← CHAIN: reutiliza la misma cadena

    return await this.cuentasCobroService.update(+id, body);

  }

  @Delete(':id')
  @ResponseMessage('Cuenta de cobro eliminada exitosamente')
  async deleteAccountReceivable(@Param('id') id: number) {
    if (!(await this.cuentasCobroService.accountReceivableExistsById(+id))) {
      throw new BadRequestException("Cuenta de cobro no encontrada");
    }

    const data = await this.cuentasCobroService.delete(id);
    await this.revisionesService.deleteByIdAccountReceivable(id);

    return data;
  }
}
