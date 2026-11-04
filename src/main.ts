import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get('PORT') ?? 3000);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BookStore E-Commerce API')
    .setDescription(
      'REST API BookStore E-Commerce: katalog buku, pelanggan, pesanan, pembayaran, dan pengiriman.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);

  Logger.log(
    `Aplikasi berjalan di http://localhost:${port}/api`,
    'Bootstrap',
  );
  Logger.log(`Dokumentasi API di http://localhost:${port}/docs`, 'Bootstrap');
}

await bootstrap();
