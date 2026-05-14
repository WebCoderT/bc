import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let vipToken: string;
  let userToken: string;
  let registeredUserId: number;
  const caseUsername = `u${Date.now().toString().slice(-10)}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api should expose service info', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe('ok');
        expect(response.body.swagger.public).toBe('/docs/public');
      });
  });

  it('POST /api/auth/register should create a normal user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username: caseUsername,
        password: 'Case@123',
      })
      .expect(201);

    expect(response.body.user.role).toBe('user');
    registeredUserId = response.body.user.id;
  });

  it('POST /api/auth/login should return tokens for seeded users', async () => {
    const adminResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'admin_root',
        password: 'Admin@123',
      });

    const vipResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'vip_demo',
        password: 'Vip@123',
      });

    const userResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: caseUsername,
        password: 'Case@123',
      });

    expect(adminResponse.status).toBe(201);
    expect(vipResponse.status).toBe(201);
    expect(userResponse.status).toBe(201);

    adminToken = adminResponse.body.accessToken;
    vipToken = vipResponse.body.accessToken;
    userToken = userResponse.body.accessToken;
  });

  it('GET /api/member/dashboard should allow logged-in users', () => {
    return request(app.getHttpServer())
      .get('/api/member/dashboard')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.user.username).toBe(caseUsername);
      });
  });

  it('GET /api/vip/insights should reject normal users', () => {
    return request(app.getHttpServer())
      .get('/api/vip/insights')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('GET /api/vip/insights should allow vip users', () => {
    return request(app.getHttpServer())
      .get('/api/vip/insights')
      .set('Authorization', `Bearer ${vipToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.reports).toHaveLength(3);
      });
  });

  it('PATCH /api/admin/users/:id/role should allow admin to promote users', async () => {
    await request(app.getHttpServer())
      .patch(`/api/admin/users/${registeredUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'vip' })
      .expect(200)
      .expect((response) => {
        expect(response.body.user.role).toBe('vip');
      });

    const reloginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: caseUsername,
        password: 'Case@123',
      })
      .expect(201);

    userToken = reloginResponse.body.accessToken;

    await request(app.getHttpServer())
      .get('/api/vip/insights')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });

  it('GET /api/admin/users should reject non-admin token', () => {
    return request(app.getHttpServer())
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${vipToken}`)
      .expect(403);
  });
});
