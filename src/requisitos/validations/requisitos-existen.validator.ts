/**
 * ============================================================================
 * REQUISITOS EXISTEN VALIDATOR — CHAIN OF RESPONSIBILITY (GoF) — Eslabón 4
 * ============================================================================
 *
 * PATRÓN: CHAIN OF RESPONSIBILITY (Comportamiento)
 *
 * ANTES: La validación de requisitos existentes estaba en el controlador:
 *   async create(@Body() body: CreateCuentasCobroDto) {
 *     if (body.requisitos) {
 *       for (const item of body.requisitos) {
 *         const reqExiste = await this.requisitosService.requirementExistsById(item.id_requisito);
 *         if (!reqExiste) {
 *           throw new BadRequestException(`Requisito con id ${item.id_requisito} no encontrado`);
 *         }
 *       }
 *     }
 *     // ... seguir con la lógica
 *   }
 *   → Repetido en 4 endpoints; el controlador dependía de RequisitosService.
 *
 * DESPUÉS: Este eslabón encapsula la validación.
 *   Si algún requisito no existe, lanza BadRequestException y DETIENE la cadena.
 *   Si todos existen, la cadena termina (es el último eslabón).
 *
 * DEPENDENCIAS:
 *   - RequisitosService: para verificar si cada requisito existe
 *   - CuentaCobroValidator: clase base abstracta (define validate + setNext)
 *
 * NOTA: Este es el ÚLTIMO eslabón de la cadena. No tiene siguiente.
 * ============================================================================
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateCuentasCobroDto } from 'src/cuentas-cobro/dto/update-cuentas-cobro.dto';
import { CuentaCobroValidator } from 'src/cuentas-cobro/validations/cuenta-cobro.validator';
import { RequisitosService } from 'src/requisitos/services/requisitos.service';


@Injectable()
export class RequisitosExistenValidator extends CuentaCobroValidator {
  constructor(private readonly requisitosService: RequisitosService) {
    super();
  }

  /** CHAIN: Valida que todos los requisitos existan. Si falla, lanza excepción. */
  protected async check(body: UpdateCuentasCobroDto): Promise<void> {
    if (!body.requisitos) return;

    for (const item of body.requisitos) {
      if (!(await this.requisitosService.requirementExistsById(item.id_requisito))) {
        throw new BadRequestException(`Requisito con id ${item.id_requisito} no encontrado`);
      }
    }
  }
}
