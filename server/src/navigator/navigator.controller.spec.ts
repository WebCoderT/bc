import { Test, TestingModule } from '@nestjs/testing';
import { NavigatorController } from './navigator.controller';
import { NavigatorService } from './navigator.service';

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
