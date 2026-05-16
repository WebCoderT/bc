import { Test, TestingModule } from '@nestjs/testing';
import { GameModelService } from './game-model.service';

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
