import { Test, TestingModule } from '@nestjs/testing';
import { GameModelController } from './game-model.controller';
import { GameModelService } from './game-model.service';

describe('GameModelController', () => {
  let controller: GameModelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameModelController],
      providers: [GameModelService],
    }).compile();

    controller = module.get<GameModelController>(GameModelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
