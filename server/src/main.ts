import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

/**
 * 应用启动入口，负责创建 Nest 实例并启动 HTTP 服务。
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(process.env.PORT ?? 8000);
}

/**
 * 执行服务启动流程。
 */
bootstrap();
