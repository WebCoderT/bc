import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';

/**
 * GameService 基础单元测试，验证服务可被 Nest 正常实例化。
 */
describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
