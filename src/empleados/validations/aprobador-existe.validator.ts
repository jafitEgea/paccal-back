/**
 * ============================================================================
 * APROBADOR EXISTE VALIDATOR — CHAIN OF RESPONSIBILITY (GoF) — Eslabón 2
 * ============================================================================
 *
 * PATRÓN: CHAIN OF RESPONSIBILITY (Comportamiento)
 *
 * ANTES: La validación de aprobador existente estaba en el controlador:
 *   async create(@Body() body: CreateCuentasCobroDto) {
 *     const aprobadorExiste = await this.empleadosService.employeeExistsById(body.id_aprobador);
 *     if (!aprobadorExiste) {
 *       throw new BadRequestException('Empleado Aprobador no encontrado');
 *     }
 *     // ... seguir con la lógica
 *   }
 *   → Repetido en 4 endpoints; el controlador dependía de EmpleadosService.
 *
 * DESPUÉS: Este eslabón encapsula la validación.
 *   Si el aprobador no existe, lanza BadRequestException y DETIENE la cadena.
 *   Si existe, delega al siguiente eslabón (RevisorExisteValidator).
 *
 * DEPENDENCIAS:
 *   - EmpleadosService: para verificar si el empleado aprobador existe
 *   - CuentaCobroValidator: clase base abstracta (define validate + setNext)
 * ============================================================================
 */

import { EmpleadosService } from "src/empleados/services/empleados.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { CuentaCobroValidator } from "src/cuentas-cobro/validations/cuenta-cobro.validator";
import { UpdateCuentasCobroDto } from "src/cuentas-cobro/dto/update-cuentas-cobro.dto";

@Injectable()
export class AprobadorExisteValidator extends CuentaCobroValidator {
    constructor (private readonly empleadosService: EmpleadosService){
        super();
    }

    /** CHAIN: Valida que el aprobador exista. Si falla, lanza excepción. */
    protected async check(body: UpdateCuentasCobroDto): Promise<void> {
        if(!(await this.empleadosService.employeeExistsById(body.id_aprobador)))
        throw new BadRequestException('Empleado Aprobador no encontrado')
    }

}