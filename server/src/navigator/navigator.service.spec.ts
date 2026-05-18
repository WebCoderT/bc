import { Test, TestingModule } from '@nestjs/testing';
import { NavigatorService } from './navigator.service';

/**
 * NavigatorService 基础单元测试，验证服务可被 Nest 正常实例化。
 */
describe('NavigatorService', () => {
  let service: NavigatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NavigatorService],
    }).compile();

    service = module.get<NavigatorService>(NavigatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
