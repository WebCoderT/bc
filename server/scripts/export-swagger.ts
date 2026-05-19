import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { createSwaggerDocuments } from '../src/swagger/swagger.config';

async function main() {
  const outputDirectory = path.resolve(
    process.cwd(),
    process.env.SWAGGER_EXPORT_DIR ?? '.generated-swagger',
  );

  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  configureApp(app);
  await app.init();

  const { publicDocument, memberDocument, adminDocument } =
    createSwaggerDocuments(app);

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(outputDirectory, 'public.json'),
      JSON.stringify(publicDocument, null, 2),
      'utf8',
    ),
    writeFile(
      path.join(outputDirectory, 'member.json'),
      JSON.stringify(memberDocument, null, 2),
      'utf8',
    ),
    writeFile(
      path.join(outputDirectory, 'admin.json'),
      JSON.stringify(adminDocument, null, 2),
      'utf8',
    ),
  ]);

  await app.close();

  console.log(`Swagger documents exported to ${outputDirectory}`);
}

main().catch((error) => {
  console.error('Failed to export Swagger documents.');
  console.error(error);
  process.exitCode = 1;
});
