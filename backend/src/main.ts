import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;
  const corsOrigin = configService.get<string>('CORS_ORIGIN');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use(helmet());
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(port, () => {
    Logger.log(`🚀 Aplicação rodando na URL: http://localhost:${port}`);
  });
}
bootstrap();
