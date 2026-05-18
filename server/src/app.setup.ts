import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { setupSwagger } from './swagger/swagger.config';

/**
 * 应用启动配置函数，统一注册 CORS、全局前缀、校验、拦截器与 Swagger。
 */
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
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  setupSwagger(app);
}
