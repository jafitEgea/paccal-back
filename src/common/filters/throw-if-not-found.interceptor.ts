/**
 * ============================================================================
 * THROW IF NOT FOUND INTERCEPTOR — DECORATOR (GoF)
 * ============================================================================
 *
 * PATRÓN: DECORATOR (Estructural)
 *
 * PROBLEMA (ANTES):
 *   Este bloque se repetía ~20 veces en los servicios:
 *   const result = await this.accessService.executeQuery(query);
 *   if (JSON.stringify(result) == '[]') {
 *     throw new NotFoundException("...");
 *   }
 *   if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
 *     throw new InternalServerErrorException('Error');
 *   }
 *   → Violación de DRY; cambiar el criterio = tocar ~20 lugares.
 *
 * SOLUCIÓN (DESPUÉS):
 *   Se implementa como NestInterceptor (mecanismo nativo de NestJS para
 *   envolver la ejecución de un handler). Se aplica declarativamente:
 *   @UseInterceptors(new ThrowIfNotFoundInterceptor('Mensaje'))
 *   → Sin tocar la firma ni el cuerpo del método que decora.
 *
 * POR QUÉ DECORATOR Y NO OTRO:
 *   Se necesita envolver la ejecución de un handler SIN MODIFICARLO.
 *   Esa es la definición exacta del patrón Decorator.
 *   El interceptor de NestJS es el mecanismo nativo para esto.
 *
 * VENTAJA ADICIONAL:
 *   Los errores de ODBC ahora se lanzan como excepciones reales (Adapter),
 *   así que el chequeo de 'Error al ejecutar la consulta' ya no hace falta.
 *   El 404 por resultado vacío lo maneja este interceptor.
 * ============================================================================
 */

import {CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException} from '@nestjs/common';
import { Observable, map } from 'rxjs';


@Injectable()
export class ThrowIfNotFoundInterceptor implements NestInterceptor {
  constructor(private readonly message: string) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result) => {
        const isEmpty = result === null || result === undefined || (Array.isArray(result) && result.length === 0);

        if (isEmpty) {
          throw new NotFoundException(this.message);
        }

        return result;
      }),
    );
  }
}
