import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.enableCors();

  const apiPrefix = configService.get<string>('api.prefix') || 'api';
  const apiVersion = configService.get<string>('api.version') || '1';

  app.setGlobalPrefix(apiPrefix);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  const config = new DocumentBuilder()
    .setTitle('Mini ERP API')
    .setDescription('Mini ERP Invoicing System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
}
void bootstrap();
