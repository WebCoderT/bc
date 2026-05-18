import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * AppController 单元测试，验证系统探活接口基础行为。
 */
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  /**
   * 探活接口测试分组。
   */
  describe('root', () => {
    it('should return service status', () => {
      expect(appController.getHello()).toEqual(
        expect.objectContaining({
          message: 'service alive',
        }),
      );
    });
  });
});
