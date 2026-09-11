/**
 * ============================================================================
 * CUENTA COBRO VALIDATOR — CHAIN OF RESPONSIBILITY (GoF)
 * ============================================================================
 *
 * PATRÓN: CHAIN OF RESPONSIBILITY (Comportamiento)
 *
 * PROBLEMA (ANTES):
 *   La validación de existencia (contrato, aprobador, revisor, requisitos)
 *   se repetía en 4 endpoints del controlador:
 *   - /verify
 *   - /verify-for-update
 *   - POST (create)
 *   - PUT (update)
 *   → El controlador conocía 4 servicios de dominio solo para repetir validaciones.
 *   → Mezclaba enrutamiento HTTP con reglas de negocio.
 *
 * SOLUCIÓN (DESPUÉS):
 *   Cada validación es un "eslabón" que puede:
 *   1. Ejecutar su validación concreta (check)
 *   2. Detener el flujo con su propia excepción
 *   3. Delegar al siguiente eslabón (setNext)
 *
 *   La cadena se ensambla UNA sola vez en CuentasCobroValidationChain.
 *   Agregar una 6ª validación futura = nuevo eslabón (cumple OCP).
 *
 * POR QUÉ CHAIN OF RESPONSIBILITY Y NO OTRO:
 *   - No es Strategy: no se elige un algoritmo, se encadenan múltiples validaciones.
 *   - No es Simple Array: cada validación necesita poder DETENER el flujo.
 *   - Chain of Responsibility expresa esto con claridad: cada eslabón puede
 *     lanzar una excepción y detener la cadena.
 * ============================================================================
 */

import { DatabaseGateway } from "src/assets/db/interfaces/database-gateway.interface";
import { UpdateCuentasCobroDto } from "../dto/update-cuentas-cobro.dto";

export abstract class CuentaCobroValidator {
    private next: CuentaCobroValidator | null = null;

    /**
     * CHAIN: Enlaza al siguiente eslabón de la cadena.
     * Retorna el siguiente para permitir encadenamiento:
     *   validator1.setNext(validator2).setNext(validator3)
     */
    setNext(validator: CuentaCobroValidator): CuentaCobroValidator {
        this.next = validator;
        return validator;
    }

    /**
     * CHAIN: Ejecuta la validación y delega al siguiente eslabón.
     * Si check() lanza una excepción, la cadena se DETIENE ahí.
     */
    async validate(body: UpdateCuentasCobroDto, tx?: DatabaseGateway): Promise<void> {
        await this.check(body, tx);  // Ejecuta validación concreta

        if (this.next) {
            await this.next.validate(body, tx);  // Delega al siguiente
        }
    }

    /**
     * Cada eslabón concreto implementa su propia lógica de validación.
     * Si falla, lanza BadRequestException y detiene la cadena.
     */
    protected abstract check(body: UpdateCuentasCobroDto, tx?: DatabaseGateway): Promise<void>;

}