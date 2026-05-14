import { INestApplication, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './swagger/swagger.config';

export function configureApp(app: INestApplication) {
  app.enableCors({
    origin: ['http://localhost:8001', 'http://localhost:8002'],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);
}
