import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { PublicModule } from '../public/public.module';
import { VipModule } from '../vip/vip.module';

function createBaseConfig(title: string, description: string) {
  return new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '请填入登录后返回的 accessToken',
      },
      'JWT-auth',
    )
    .build();
}

export function setupSwagger(app: INestApplication) {
  const publicDocument = SwaggerModule.createDocument(
    app,
    createBaseConfig('Public API', '公开访问与认证入口文档'),
    {
      include: [PublicModule, AuthModule],
    },
  );

  const memberDocument = SwaggerModule.createDocument(
    app,
    createBaseConfig('Member API', '普通用户与 VIP 用户文档'),
    {
      include: [AuthModule, MemberModule, VipModule],
    },
  );

  const adminDocument = SwaggerModule.createDocument(
    app,
    createBaseConfig('Admin API', '后台管理员文档'),
    {
      include: [AuthModule, AdminModule],
    },
  );

  SwaggerModule.setup('docs/public', app, publicDocument);
  SwaggerModule.setup('docs/member', app, memberDocument);
  SwaggerModule.setup('docs/admin', app, adminDocument);
}
