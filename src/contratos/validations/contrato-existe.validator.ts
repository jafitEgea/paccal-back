/**
 * ============================================================================
 * CONTRATO EXISTE VALIDATOR — CHAIN OF RESPONSIBILITY (GoF) — Eslabón 1
 * ============================================================================
 *
 * PATRÓN: CHAIN OF RESPONSIBILITY (Comportamiento)
 *
 * ANTES: La validación de contrato existente estaba en el controlador:
 *   async create(@Body() body: CreateCuentasCobroDto) {
 *     const contratoExiste = await this.contratosService.contractExistsById(body.id_contrato);
 *     if (!contratoExiste) {
 *       throw new BadRequestException('Contrato no encontrado');
 *     }
 *     // ... seguir con la lógica
 *   }
 *   → Repetido en 4 endpoints; el controlador dependía de ContratosService.
 *
 * DESPUÉS: Este eslabón encapsula la validación.
 *   Si el contrato no existe, lanza BadRequestException y DETIENE la cadena.
 *   Si existe, delega al siguiente eslabón (AprobadorExisteValidator).
 *
 * DEPENDENCIAS:
 *   - ContratosService: para verificar si el contrato existe
 *   - CuentaCobroValidator: clase base abstracta (define validate + setNext)
 * ============================================================================
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { ContratosService } from 'src/contratos/services/contratos.service';
import { UpdateCuentasCobroDto } from 'src/cuentas-cobro/dto/update-cuentas-cobro.dto';
import { CuentaCobroValidator } from 'src/cuentas-cobro/validations/cuenta-cobro.validator';

@Injectable()
export class ContratoExisteValidator extends CuentaCobroValidator {
  constructor(private readonly contratosService: ContratosService) {
    super();
  }

  /** CHAIN: Valida que el contrato exista. Si falla, lanza excepción. */
  protected async check(body: UpdateCuentasCobroDto): Promise<void> {
    if (!(await this.contratosService.contractExistsById(body.id_contrato))) {
      throw new BadRequestException('Contrato no encontrado');
    }
  }
}
