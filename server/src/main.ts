import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bảo mật (checklist §7): header an toàn + validation toàn cục chống injection/XSS qua DTO
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api/v1');

  // API docs (checklist §12 — Swagger)
  const doc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('POTTER 3.0 API')
      .setDescription('Backend app trekking — theo docs/api-contract.md')
      .setVersion('3.0.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('docs', app, doc);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  new Logger('Bootstrap').log(`API http://localhost:${port}/api/v1 — Swagger /docs`);
}
bootstrap();
