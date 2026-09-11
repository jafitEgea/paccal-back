import { CallHandler, ExecutionContext, Injectable, NestInterceptor,} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {

    constructor(
        private readonly reflector: Reflector,
    ){}

    intercept(_context: ExecutionContext, next: CallHandler<T>, ): Observable<ApiResponse<T>> {
        const message = this.reflector.get<string>('response_message', _context.getHandler(),);
        return next.handle().pipe(
            map((data) => ({
                success: true,
                data,
                ...(message && { message })
            })),
        );
    }
}
