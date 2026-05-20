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

export type WalletBalanceUpdatedPayload = {
  userId: number;
  rechargeAmount: number;
  bonusAmount: number;
  totalBalance: number;
  changeAmount: number;
  reason: 'bet-created' | 'bet-settled' | 'admin-updated';
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

  emitWalletBalanceUpdated(payload: WalletBalanceUpdatedPayload) {
    this.emitter.emit('wallet.balance.updated', payload);
  }

  onWalletBalanceUpdated(
    listener: (payload: WalletBalanceUpdatedPayload) => void,
  ) {
    this.emitter.on('wallet.balance.updated', listener);

    return () => {
      this.emitter.off('wallet.balance.updated', listener);
    };
  }
}
