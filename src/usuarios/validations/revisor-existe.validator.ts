/**
 * ============================================================================
 * REVISOR EXISTE VALIDATOR — CHAIN OF RESPONSIBILITY (GoF) — Eslabón 3
 * ============================================================================
 *
 * PATRÓN: CHAIN OF RESPONSIBILITY (Comportamiento)
 *
 * ANTES: La validación de revisor existente estaba en el controlador:
 *   async create(@Body() body: CreateCuentasCobroDto) {
 *     const revisorExiste = await this.usuariosService.userExistsById(body.id_revisor);
 *     if (!revisorExiste) {
 *       throw new BadRequestException('Usuario Revisor no encontrado');
 *     }
 *     // ... seguir con la lógica
 *   }
 *   → Repetido en 4 endpoints; el controlador dependía de UsuariosService.
 *
 * DESPUÉS: Este eslabón encapsula la validación.
 *   Si el revisor no existe, lanza BadRequestException y DETIENE la cadena.
 *   Si existe, delega al siguiente eslabón (RequisitosExistenValidator).
 *
 * DEPENDENCIAS:
 *   - UsuariosService: para verificar si el usuario revisor existe
 *   - CuentaCobroValidator: clase base abstracta (define validate + setNext)
 * ============================================================================
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/services/usuarios.service';
import { UpdateCuentasCobroDto } from 'src/cuentas-cobro/dto/update-cuentas-cobro.dto';
import { CuentaCobroValidator } from 'src/cuentas-cobro/validations/cuenta-cobro.validator';

@Injectable()
export class RevisorExisteValidator extends CuentaCobroValidator {
  constructor(private readonly usuariosService: UsuariosService) {
    super();
  }

  /** CHAIN: Valida que el revisor exista. Si falla, lanza excepción. */
  protected async check(body: UpdateCuentasCobroDto): Promise<void> {
    if (!(await this.usuariosService.userExistsById(body.id_revisor))) {
      throw new BadRequestException('Usuario Revisor no encontrado');
    }
  }
}
