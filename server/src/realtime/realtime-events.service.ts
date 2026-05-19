import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

export type GameDrawUpdatedPayload = {
  gameId: number;
  record: {
    id: number;
    issueNo: string;
    openCode: string;
    openCodeJson: unknown;
    resultPayload: Record<string, unknown> | null;
    drawTime: string;
    drawStatus: string;
    sourceType: string;
    algorithmVersion: string;
    createdAt: string;
    updatedAt: string;
  };
  currentIssue: {
    gameId: number;
    serverTime: string;
    currentIssue: string | null;
    lastDrawAt: string | null;
    nextDrawAt: string;
    drawInterval: number;
    status: string;
  };
};

@Injectable()
export class RealtimeEventsService {
  private readonly emitter = new EventEmitter();

  emitGameDrawUpdated(payload: GameDrawUpdatedPayload) {
    this.emitter.emit('game.draw.updated', payload);
  }

  onGameDrawUpdated(listener: (payload: GameDrawUpdatedPayload) => void) {
    this.emitter.on('game.draw.updated', listener);

    return () => {
      this.emitter.off('game.draw.updated', listener);
    };
  }
}
