import { Injectable } from '@nestjs/common';
import { GameDrawTableService } from './game-draw-table.service';

@Injectable()
export class GameDrawHistoryService {
  constructor(private readonly gameDrawTableService: GameDrawTableService) {}

  listRecentDraws(gameId: number, page = 1, pageSize = 20) {
    return this.gameDrawTableService.listDrawRecords(gameId, page, pageSize);
  }

  getLatestDrawRecord(gameId: number) {
    return this.gameDrawTableService.getLatestDrawRecord(gameId);
  }
}
