import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Role } from '../common/enums/role.enum';
import { AuthService } from '../auth/auth.service';
import { GameService } from '../game/game.service';
import { GameDrawService } from '../game-draw/game-draw.service';
import { RealtimeEventsService } from './realtime-events.service';
import { UserPresenceService } from '../users/user-presence.service';

type AuthenticatedSocket = Socket & {
  data: {
    user?: {
      id: number;
      username: string;
      role: Role;
    };
  };
};

type JoinGameRoomPayload = {
  gameId: number;
};

const ADMIN_USERS_ROOM = 'admin:users';

@WebSocketGateway({
  path: '/ws/socket.io',
  cors: {
    origin: ['http://localhost:8001', 'http://localhost:8002'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class GameRealtimeGateway implements OnGatewayInit, OnGatewayDisconnect {
  private readonly logger = new Logger(GameRealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly gameService: GameService,
    private readonly gameDrawService: GameDrawService,
    private readonly realtimeEventsService: RealtimeEventsService,
    private readonly userPresenceService: UserPresenceService,
  ) {}

  afterInit() {
    this.realtimeEventsService.onGameDrawUpdated((payload) => {
      this.server
        .to(this.getGameRoomName(payload.gameId))
        .emit('game:draw-updated', payload);
    });

    this.realtimeEventsService.onWalletBalanceUpdated((payload) => {
      this.server
        .to(this.getUserRoomName(payload.userId))
        .emit('wallet:balance-updated', payload);
    });
  }

  async handleConnection(client: AuthenticatedSocket) {
    const token = this.extractToken(client);

    if (!token) {
      client.emit('socket:error', { message: '缺少访问令牌' });
      client.disconnect();
      return;
    }

    try {
      const user = await this.authService.verifyToken(token);

      client.data.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };

      client.join(this.getUserRoomName(user.id));

      this.userPresenceService.registerConnection({
        socketId: client.id,
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      client.emit('socket:ready', {
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      this.emitAdminUserPresence(user.id);
    } catch (error) {
      this.logger.warn(
        `Socket ${client.id} 鉴权失败: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
      client.emit('socket:error', { message: '鉴权失败' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.user?.id;

    this.userPresenceService.unregisterConnection(client.id);

    if (typeof userId === 'number') {
      this.emitAdminUserPresence(userId);
    }
  }

  @SubscribeMessage('admin:subscribe-users')
  handleAdminSubscribe(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.data.user?.role !== Role.Admin) {
      client.emit('socket:error', { message: '无权限订阅用户状态' });
      return { ok: false };
    }

    client.join(ADMIN_USERS_ROOM);
    return { ok: true };
  }

  @SubscribeMessage('game:join')
  async handleGameJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinGameRoomPayload,
  ) {
    const user = client.data.user;

    if (!user) {
      client.emit('socket:error', { message: '未登录，无法加入房间' });
      return { ok: false };
    }

    const gameId = Number(payload?.gameId);

    if (!Number.isInteger(gameId) || gameId < 1) {
      client.emit('game:error', { message: '无效的游戏房间 ID' });
      return { ok: false };
    }

    const existingState = this.userPresenceService.findSocketState(client.id);
    if (existingState?.currentGameRoomId) {
      client.leave(this.getGameRoomName(existingState.currentGameRoomId));
    }

    const game = await this.gameService.findOne(gameId);
    const [history, currentIssue] = await Promise.all([
      this.gameDrawService.listRecentDraws(gameId, { page: 1, pageSize: 20 }),
      this.gameDrawService.getCurrentIssue(gameId),
    ]);

    client.join(this.getGameRoomName(gameId));
    this.userPresenceService.setCurrentGameRoom(client.id, gameId, game.label);
    this.emitAdminUserPresence(user.id);

    client.emit('game:joined', {
      gameId,
      gameLabel: game.label,
      message: `已进入《${game.label}》房间`,
    });
    client.emit('game:snapshot', {
      gameId,
      gameLabel: game.label,
      currentIssue,
      records: history.items,
    });

    return { ok: true };
  }

  @SubscribeMessage('game:leave')
  handleGameLeave(@ConnectedSocket() client: AuthenticatedSocket) {
    const user = client.data.user;
    const currentState = this.userPresenceService.findSocketState(client.id);

    if (currentState?.currentGameRoomId) {
      client.leave(this.getGameRoomName(currentState.currentGameRoomId));
    }

    this.userPresenceService.setCurrentGameRoom(client.id, null, null);

    if (user) {
      this.emitAdminUserPresence(user.id);
    }

    client.emit('game:left', { ok: true });
    return { ok: true };
  }

  private emitAdminUserPresence(userId: number) {
    this.server.to(ADMIN_USERS_ROOM).emit('admin:user-presence-updated', {
      ...this.userPresenceService.toPresenceUpdate(userId),
    });
  }

  private getGameRoomName(gameId: number) {
    return `game:${gameId}`;
  }

  private getUserRoomName(userId: number) {
    return `user:${userId}`;
  }

  private extractToken(client: Socket) {
    const authToken =
      typeof client.handshake.auth?.token === 'string'
        ? client.handshake.auth.token
        : null;

    if (authToken) {
      return authToken;
    }

    const authorizationHeader = client.handshake.headers.authorization;

    if (typeof authorizationHeader === 'string') {
      return authorizationHeader.replace(/^Bearer\s+/i, '').trim();
    }

    const queryToken = client.handshake.query.token;
    return typeof queryToken === 'string' ? queryToken : null;
  }
}
