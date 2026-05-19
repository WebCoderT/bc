import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { PublicModule } from '../public/public.module';
import { VipModule } from '../vip/vip.module';

export type SwaggerDocuments = {
  publicDocument: ReturnType<typeof SwaggerModule.createDocument>;
  memberDocument: ReturnType<typeof SwaggerModule.createDocument>;
  adminDocument: ReturnType<typeof SwaggerModule.createDocument>;
};

/**
 * 创建 Swagger 基础配置，复用标题、描述和统一 Bearer 鉴权定义。
 */
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

/**
 * 为公开、会员和管理员三个文档分组注册 Swagger 页面。
 */
export function setupSwagger(app: INestApplication) {
  const { publicDocument, memberDocument, adminDocument } =
    createSwaggerDocuments(app);

  SwaggerModule.setup('docs/public', app, publicDocument);
  SwaggerModule.setup('docs/member', app, memberDocument);
  SwaggerModule.setup('docs/admin', app, adminDocument);
}

export function createSwaggerDocuments(
  app: INestApplication,
): SwaggerDocuments {
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

  return {
    publicDocument,
    memberDocument,
    adminDocument,
  };
}
