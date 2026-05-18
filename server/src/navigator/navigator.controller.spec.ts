import { Test, TestingModule } from '@nestjs/testing';
import { NavigatorController } from './navigator.controller';
import { NavigatorService } from './navigator.service';

/**
 * NavigatorController 基础单元测试，验证控制器可被 Nest 正常实例化。
 */
describe('NavigatorController', () => {
  let controller: NavigatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NavigatorController],
      providers: [NavigatorService],
    }).compile();

    controller = module.get<NavigatorController>(NavigatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
