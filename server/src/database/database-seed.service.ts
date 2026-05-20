import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AppProfileService } from '../app-profile/app-profile.service';
import { GameModelService } from '../game-model/game-model.service';
import { GameService } from '../game/game.service';
import { NavigatorService } from '../navigator/navigator.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    private readonly appProfileService: AppProfileService,
    private readonly gameModelService: GameModelService,
    private readonly navigatorService: NavigatorService,
    private readonly gameService: GameService,
    private readonly usersService: UsersService,
  ) {}

  async onApplicationBootstrap() {
    await this.appProfileService.ensureProfileInitialized();
    await this.gameModelService.ensureDefaultGameModels();
    await this.navigatorService.ensureDefaultGameNavigations();
    await this.gameService.ensureDefaultGames();
    await this.usersService.ensureDemoUsers();

    this.logger.log('Default bootstrap data ensured');
  }
}
