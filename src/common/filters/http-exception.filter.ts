import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;

        const message =
            typeof exceptionResponse === 'string'
                ? exceptionResponse
                : exceptionResponse?.['message']
                ?? 'Error interno del servidor';

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
        });
    }
}
