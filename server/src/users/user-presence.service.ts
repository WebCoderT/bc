import { Injectable } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';

type SocketPresenceState = {
  socketId: string;
  userId: number;
  username: string;
  role: Role;
  connectedAt: Date;
  lastActiveAt: Date;
  currentGameRoomId: number | null;
  currentGameRoomLabel: string | null;
};

export type UserPresenceSnapshot = {
  userId: number;
  isOnline: boolean;
  onlineStatus: 'online' | 'offline';
  currentGameRoomId: number | null;
  currentGameRoomLabel: string | null;
  lastActiveAt: string | null;
  activeConnections: number;
};

@Injectable()
export class UserPresenceService {
  private readonly socketStates = new Map<string, SocketPresenceState>();

  registerConnection(params: {
    socketId: string;
    userId: number;
    username: string;
    role: Role;
  }) {
    const now = new Date();

    this.socketStates.set(params.socketId, {
      socketId: params.socketId,
      userId: params.userId,
      username: params.username,
      role: params.role,
      connectedAt: now,
      lastActiveAt: now,
      currentGameRoomId: null,
      currentGameRoomLabel: null,
    });
  }

  unregisterConnection(socketId: string) {
    this.socketStates.delete(socketId);
  }

  touch(socketId: string) {
    const state = this.socketStates.get(socketId);

    if (!state) {
      return;
    }

    state.lastActiveAt = new Date();
  }

  setCurrentGameRoom(
    socketId: string,
    gameId: number | null,
    gameLabel: string | null,
  ) {
    const state = this.socketStates.get(socketId);

    if (!state) {
      return;
    }

    state.currentGameRoomId = gameId;
    state.currentGameRoomLabel = gameLabel;
    state.lastActiveAt = new Date();
  }

  findSocketState(socketId: string) {
    return this.socketStates.get(socketId) ?? null;
  }

  findSnapshotByUserId(userId: number): UserPresenceSnapshot | null {
    const states = [...this.socketStates.values()].filter(
      (item) => item.userId === userId,
    );

    if (states.length === 0) {
      return null;
    }

    const latestRoomState = [...states]
      .filter((item) => item.currentGameRoomId !== null)
      .sort(
        (left, right) =>
          right.lastActiveAt.getTime() - left.lastActiveAt.getTime(),
      )[0];

    const latestActiveAt = [...states]
      .map((item) => item.lastActiveAt.getTime())
      .sort((left, right) => right - left)[0];

    return {
      userId,
      isOnline: true,
      onlineStatus: 'online',
      currentGameRoomId: latestRoomState?.currentGameRoomId ?? null,
      currentGameRoomLabel: latestRoomState?.currentGameRoomLabel ?? null,
      lastActiveAt: latestActiveAt
        ? new Date(latestActiveAt).toISOString()
        : null,
      activeConnections: states.length,
    };
  }

  toPresenceUpdate(userId: number): UserPresenceSnapshot {
    return (
      this.findSnapshotByUserId(userId) ?? {
        userId,
        isOnline: false,
        onlineStatus: 'offline',
        currentGameRoomId: null,
        currentGameRoomLabel: null,
        lastActiveAt: null,
        activeConnections: 0,
      }
    );
  }
}
