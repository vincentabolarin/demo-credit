import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

interface HealthCheckResponseBody {
  success: boolean;
  message: string;
  data: {
    status: 'ok' | 'error';
    database: 'connected' | 'disconnected';
    error?: string;
  };
  meta?: any;
}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET) should return health check', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as HealthCheckResponseBody;
        expect(body).toHaveProperty('success', true);
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('status', 'ok');
      });
  });
});
