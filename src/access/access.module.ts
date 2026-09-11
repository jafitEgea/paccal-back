/**
 * ============================================================================
 * MÓDULO ACCESS — SINGLETON + ADAPTER (GoF)
 * ============================================================================
 *
 * PATRÓN 1: SINGLETON (Creación)
 * ─────────────────────────────
 * ANTES: Cada llamada a executeQuery() creaba una nueva conexión ODBC:
 *   async executeQuery(query: string) {
 *     const connection = await require('odbc').connect(...); // NUEVA CADA VEZ
 *     return await connection.query(query);
 *   }
 *   → MS Access usa locking a nivel de archivo; múltiples conexiones = bloqueos.
 *
 * DESPUÉS: @Injectable() sin scope explícito = SINGLETON por defecto en NestJS.
 *   @Global() garantiza acceso global a toda la app. Una sola instancia, mismo pool.
 *   → No necesitamos getInstance() manual; Nest ya lo garantiza.
 *
 * PATRÓN 2: ADAPTER (Estructural)
 * ───────────────────────────────
 * ANTES: El servicio hablaba directamente con ODBC:
 *   const connection = await require('odbc').connect(...);
 *   → Acoplamiento fuerte; cambiar de BD implicaba tocar cada método.
 *
 * DESPUÉS: Registramos el adaptador bajo el token DATABASE_GATEWAY (Symbol).
 *   AccessService inyecta la INTERFAZ, no la implementación.
 *   → Un test futuro puede reemplazarlo con overrideProvider() sin tocar nada.
 * ============================================================================
 */

import { Global, Module } from '@nestjs/common';
import { AccessService } from './access.service';
import { OdbcDatabaseGateway } from './gateway/odbc-database-gateway';
import { DATABASE_GATEWAY } from 'src/assets/db/interfaces/database-gateway.interface';

@Global()  // ← SINGLETON: toda la app comparte la misma instancia
@Module({
  controllers: [],
  providers: [
    OdbcDatabaseGateway,  // ← SINGLETON: una sola instancia por árbol de módulos
    {
      provide: DATABASE_GATEWAY,  // ← ADAPTER: token Symbol para desacoplar
      useExisting: OdbcDatabaseGateway,  // ← ADAPTER: apunta al adaptador concreto
    },
    AccessService
  ],
  exports: [AccessService],
})
export class AccessModule {}
