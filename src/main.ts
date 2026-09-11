import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true
    })
  )
  
  app.useGlobalFilters(
    new HttpExceptionFilter(),
  )

  const config = new DocumentBuilder()
    .setTitle("PACCAL API")
    .setDescription("The PACCAL API description")
    .setVersion("2.0")
    .setContact("Jafit Egea", "https://co.linkedin.com/in/jafit-egea", "jafit2015@gmail.com")
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors();
  await app.listen(3001);
}
bootstrap();
