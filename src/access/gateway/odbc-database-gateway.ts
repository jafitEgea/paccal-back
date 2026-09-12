/**
 * ============================================================================
 * ODBC DATABASE GATEWAY — SINGLETON + ADAPTER (GoF)
 * ============================================================================
 *
 * PATRÓN 1: SINGLETON (Creación)
 * ─────────────────────────────
 * ANTES: Cada llamada creaba una nueva conexión ODBC:
 *   async connectToDatabase() {
 *     this.connection = await require('odbc').connect(...); // NUEVA CADA VEZ
 *   }
 *   → MS Access usa locking a nivel de archivo; múltiples conexiones son sensibles a bloqueos.
 *
 * DESPUÉS: @Injectable() sin scope explícito = SINGLETON por defecto en NestJS.
 *   - Una sola instancia por árbol de módulos
 *   - Pool de conexiones compartido
 *   - Acceso global via @Global() en AccessModule
 *   - Inicialización lazy del pool (ensurePool) para no bloquear el arranque
 *
 * POR QUÉ SINGLETON Y NO OTRO:
 *   El problema es de "recurso compartido con restricción física" (locking de archivo).
 *   Solo Singleton garantiza una instancia única con acceso global.
 *
 * PATRÓN 2: ADAPTER (Estructural)
 * ───────────────────────────────
 * ANTES: El negocio hablaba directamente con ODBC:
 *   const connection = await require('odbc').connect(...);
 *   → Acoplamiento fuerte; cambiar de BD implicaba tocar cada método.
 *
 * DESPUÉS: Esta clase IMPLEMENTA la interfaz DatabaseGateway y TRADUCE
 *   entre ODBC y el dominio:
 *   - pool.query() → gateway.query()          (SELECT)
 *   - connection.query() → gateway.execute()   (INSERT/UPDATE/DELETE)
 *   - connection.transaction() → gateway.transaction(callback)  (TRANSACTION)
 *   - errores ODBC → InternalServerErrorException
 *
 * POR QUÉ ADAPTER Y NO BRIDGE:
 *   Bridge separa abstracción de implementación en dos dimensiones.
 *   Aquí solo hay una: traducir vocabulario. Adapter es más simple y adecuado.
 *
 * PATRÓN 2a: TRANSACTION CALLBACK ( errorCallback)
 * ──────────────────────────────────────────────────
 * El método transaction() usa un CALLBACK en vez de begin/commit/rollback manuales:
 *   await gateway.transaction(async (tx) => {
 *     await tx.execute('INSERT ...');
 *     const id = await tx.query('SELECT @@IDENTITY ...');
 *     await tx.execute('INSERT ...');
 *   });
 * → Si el callback lanza excepción, se hace ROLLBACK automático.
 * → Si termina OK, se hace COMMIT automático.
 * → La conexión se cierra siempre en el bloque finally.
 * → Más seguro que begin/commit/rollback manuales (olvidar rollback = bug silencioso).
 * ============================================================================
 */

import {Injectable, InternalServerErrorException, Logger, OnModuleDestroy} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as odbc from 'odbc';
import { DatabaseGateway, TransactionContext } from 'src/assets/db/interfaces/database-gateway.interface';


@Injectable()
export class OdbcDatabaseGateway implements DatabaseGateway, OnModuleDestroy {
    private readonly logger = new Logger(OdbcDatabaseGateway.name);

    private pool?: odbc.Pool;

    private initializingPromise: Promise<void> | null = null;

    constructor(private readonly configService: ConfigService) {  }

    /**
     * Inicializa el pool una sola vez.
     */
    private async ensurePool(): Promise<void> {
        if (this.pool) {
            this.logger.debug('Pool existente, reutilizando (SINGLETON)')
            return;
        }

        if (!this.initializingPromise) {
            this.initializingPromise = this.createPool();
        }

        try {
            await this.initializingPromise;
        } catch (error) {
            this.initializingPromise = null;
            throw error;
        }
    }

    /**
     * Crea el pool de conexiones ODBC.
     */
    private async createPool(): Promise<void> {
        // CONFIGURAR DSN EN WINDOWS:
        // Orígenes de datos ODBC 64-bit
        // DSN: paccal-dns

        const dsn = this.configService.getOrThrow<string>('ACCESS_DSN');
        const connectionTimeout = Number(this.configService.getOrThrow<string>('ACCESS_CONNECTION_TIMEOUT'));
        const loginTimeout = Number(this.configService.getOrThrow<string>('ACCESS_LOGIN_TIMEOUT'));
        const initialSize = Number(this.configService.getOrThrow<string>('ACCESS_POOL_INITIAL_SIZE'));
        const incrementSize = Number(this.configService.getOrThrow<string>('ACCESS_POOL_INCREMENT_SIZE'));
        const maxSize = Number(this.configService.getOrThrow<string>('ACCESS_POOL_MAX_SIZE'));
        const reuseConnections = this.configService.getOrThrow<string>('ACCESS_POOL_REUSE_CONNECTIONS') === 'true';
        const shrink = this.configService.getOrThrow<string>('ACCESS_POOL_SHRINK') === 'true';

        const poolConfig = {
            connectionString: `DSN=${dsn}`,
            connectionTimeout,
            loginTimeout,
            initialSize,
            incrementSize,
            maxSize,
            reuseConnections,
            shrink,
        };

        try {
            this.pool = await odbc.pool(poolConfig);
            this.logger.log(`Pool ODBC para Access creado (SINGLETON) - Conexiones iniciales: ${initialSize}`);
        } catch (error) {
            this.logger.error('Error al inicializar el pool ODBC:', error);
            throw new InternalServerErrorException('No fue posible conectar con la base de datos.');
        }
    }

    /**
     * SELECT (ADAPTER).
     * pool.query() obtiene una conexión disponible,
     * ejecuta la consulta y devuelve la conexión al pool.
     */
    async query<T = any>(sql: string): Promise<T[]> {
        await this.ensurePool();
        // Cada Query usa el mismo Pool (misma instancia)
        this.logger.debug(`Ejecutando query (pool: ${this.pool?.constructor.name})`);
        try {
            return await this.pool!.query(sql);;
        } catch (error) {
            throw this.toInternalError(error);
        }
    }

    /**
     * INSERT, UPDATE, DELETE (ADAPTER)
     */
    async execute(sql: string): Promise<void> {
        await this.ensurePool();
        try {
            await this.pool!.query(sql);
        } catch (error) {
            throw this.toInternalError(error);
        }
    }

    /**
     * Inicia una transacción (ADAPTER).
     */
    async transaction<T>(callback: (tx: TransactionContext) => Promise<T>,): Promise<T> {
        await this.ensurePool();

        const connection = await this.pool!.connect();

        const tx: TransactionContext = {
            query: async <R = any>(sql: string): Promise<R[]> => {
                try {
                    return await connection.query(sql);
                } catch (error) {
                    throw this.toInternalError(error);
                }
            },

            execute: async (sql: string): Promise<void> => {
                try {
                    await connection.query(sql);
                } catch (error) {
                    throw this.toInternalError(error);
                }
            },
        };

        try {
            await connection.beginTransaction();
            this.logger.debug("Transacción iniciada.")

            const result = await callback(tx);

            await connection.commit();
            this.logger.debug("Transacción confirmada.")

            return result;
        } catch (error) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                this.logger.error('Error realizando rollback.',rollbackError,);
            }
            throw this.toInternalError(error);
        } finally {
            await connection.close();
        }
    }

    /**
     * Cierra el pool al destruir el módulo de NestJS.
     */
    async onModuleDestroy(): Promise<void> {
        try {
            if (this.pool) {
                await this.pool.close();
                this.pool = undefined;
                this.logger.log('Pool ODBC cerrado correctamente.');
            }
        } catch (error) {
            this.logger.error('Error cerrando el pool ODBC:', error);
        }
    }

    /**
     * Convierte errores de ODBC en excepciones de NestJS (ADAPTER).
     * ANTES: el servicio devolvía strings como "Error al ejecutar la consulta"
     * DESPUÉS: lanza InternalServerErrorException que Nest maneja automáticamente
     */
    private toInternalError(error: any): InternalServerErrorException {
        const message = error?.odbcErrors?.[0]?.message ?? String(error);

        if (String(message).includes('related records')) {
            return new InternalServerErrorException(`related records: ${message}`);
        }

        return new InternalServerErrorException(`Error al ejecutar la consulta: ${message}`);
    }
}