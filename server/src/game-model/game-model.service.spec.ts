import { Test, TestingModule } from '@nestjs/testing';
import { GameModelService } from './game-model.service';

/**
 * GameModelService 基础单元测试，验证服务可被 Nest 正常实例化。
 */
describe('GameModelService', () => {
  let service: GameModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameModelService],
    }).compile();

    service = module.get<GameModelService>(GameModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
