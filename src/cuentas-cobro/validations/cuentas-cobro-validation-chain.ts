/**
 * ============================================================================
 * CUENTAS COBRO VALIDATION CHAIN — CHAIN OF RESPONSIBILITY (GoF)
 * ============================================================================
 *
 * PATRÓN: CHAIN OF RESPONSIBILITY (Comportamiento)
 *
 * PROBLEMA (ANTES):
 *   El controlador inyectaba 4 servicios y repetía la misma secuencia:
 *   const contratoExiste = await this.contratosService.contractExistsById(...);
 *   if (!contratoExiste) throw new BadRequestException('Contrato no encontrado');
 *
 *   const aprobadorExiste = await this.empleadosService.employeeExistsById(...);
 *   if (!aprobadorExiste) throw new BadRequestException('Aprobador no encontrado');
 *
 *   const revisorExiste = await this.usuariosService.userExistsById(...);
 *   if (!revisorExiste) throw new BadRequestException('Revisor no encontrado');
 *   // ... y así en 4 endpoints diferentes
 *   → Mezclaba HTTP con negocio; validaciones repetidas; acoplamiento excesivo.
 *
 * SOLUCIÓN (DESPUÉS):
 *   Esta clase ENSAMBLA la cadena una sola vez en el constructor.
 *   Los eslabones se conectan con setNext():
 *     contrato → aprobador → revisor → requisitos
 *
 *   Para ejecutar toda la cadena:
 *     await this.validationChain.validate(body);
 *
 * BENEFICIOS:
 *   1. Controlador solo conoce 1 servicio (la cadena)
 *   2. Agregar validación = nuevo eslabón (OCP)
 *   3. Cada eslabón puede detener el flujo con su excepción
 *   4. Las dependencias se inyectan por constructor (DI)
 * ============================================================================
 */

import { Injectable } from "@nestjs/common";
import { ContratoExisteValidator } from "../../contratos/validations/contrato-existe.validator";
import { AprobadorExisteValidator } from "../../empleados/validations/aprobador-existe.validator";
import { RevisorExisteValidator } from "../../usuarios/validations/revisor-existe.validator";
import { RequisitosExistenValidator } from "../../requisitos/validations/requisitos-existen.validator";
import { UpdateCuentasCobroDto } from "../dto/update-cuentas-cobro.dto";
import { DatabaseGateway } from "src/assets/db/interfaces/database-gateway.interface";

@Injectable()
export class CuentasCobroValidationChain {
    private readonly chain: ContratoExisteValidator;

    constructor(
        contratoExiste: ContratoExisteValidator,
        aprobadorExiste: AprobadorExisteValidator,
        revisorExiste: RevisorExisteValidator,
        requisitosExiste: RequisitosExistenValidator
    ) {
        // CHAIN: Ensamblamos la cadena UNA sola vez
        this.chain = contratoExiste;
        
        contratoExiste
            .setNext(aprobadorExiste)
            .setNext(revisorExiste)
            .setNext(requisitosExiste);
    }

    /**
     * CHAIN: Ejecuta toda la cadena de validaciones.
     * Si algún eslabón falla, lanza excepción y se detiene.
     */
    async validate(body: UpdateCuentasCobroDto, tx?: DatabaseGateway): Promise<void> {
        await this.chain.validate(body, tx);
    }
}