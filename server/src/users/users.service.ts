import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DataSource, Like, Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { createPaginatedResult } from '../common/utils/pagination.util';
import { DEFAULT_USER_AVATAR } from './default-avatar';
import { UserEntity } from './entities/user.entity';
import { UserPresenceService } from './user-presence.service';

type UpdateUserInput = {
  username: string;
  avatar: string;
  role: Role;
  rechargeAmount: number;
  bonusAmount: number;
  createdAt: string;
};

@Injectable()
/**
 * 用户服务负责用户创建、查询、后台分页和安全用户对象转换。
 */
export class UsersService {
  private readonly usersRepository: Repository<UserEntity>;

  /**
   * 通过数据源动态获取用户仓储，避免在模块外重复维护仓储实例。
   */
  constructor(
    private readonly dataSource: DataSource,
    private readonly userPresenceService: UserPresenceService,
  ) {
    this.usersRepository = this.dataSource.getRepository<UserEntity>('users');
  }

  /**
   * 创建普通用户并初始化默认头像、角色与余额信息。
   */
  async create(username: string, password: string): Promise<UserEntity> {
    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    const user = this.usersRepository.create({
      username,
      avatar: DEFAULT_USER_AVATAR,
      passwordHash: await bcrypt.hash(password, 10),
      role: Role.User,
      rechargeAmount: 0,
      bonusAmount: 0,
    });

    return this.usersRepository.save(user);
  }

  /**
   * 根据用户名查询用户实体，供登录流程复用。
   */
  findByUsername(username: string) {
    return this.usersRepository.findOne({ where: { username } });
  }

  /**
   * 根据用户 ID 查询单个用户实体。
   */
  findById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * 分页查询后台可见用户，并支持角色与关键字筛选。
   */
  async listPublicUsers(options?: {
    page?: number;
    pageSize?: number;
    role?: Role;
    keyword?: string;
  }) {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    const keyword = options?.keyword?.trim();

    const where = {
      ...(options?.role ? { role: options.role } : {}),
      ...(keyword ? { username: Like(`%${keyword}%`) } : {}),
    };

    const [users, total] = await this.usersRepository.findAndCount({
      where,
      order: { id: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return createPaginatedResult(
      users.map((user) => this.toSafeUser(user)),
      total,
      page,
      pageSize,
    );
  }

  /**
   * 更新后台用户资料，并在必要时校验用户名唯一性。
   */
  async updateUser(id: number, input: UpdateUserInput) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.username !== input.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: input.username },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('用户名已存在');
      }
    }

    user.username = input.username;
    user.avatar = input.avatar?.trim() || DEFAULT_USER_AVATAR;
    user.role = input.role;
    user.rechargeAmount = input.rechargeAmount;
    user.bonusAmount = input.bonusAmount;
    user.createdAt = new Date(input.createdAt);

    const savedUser = await this.usersRepository.save(user);
    return this.toSafeUser(savedUser);
  }

  /**
   * 将用户实体转换为不含敏感字段的安全用户对象。
   */
  toSafeUser(user: UserEntity) {
    const createdAt =
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : new Date(user.createdAt).toISOString();
    const presence = this.userPresenceService.findSnapshotByUserId(user.id);

    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar?.trim() || DEFAULT_USER_AVATAR,
      role: user.role,
      rechargeAmount: Number(user.rechargeAmount ?? 0),
      bonusAmount: Number(user.bonusAmount ?? 0),
      totalBalance:
        Number(user.rechargeAmount ?? 0) + Number(user.bonusAmount ?? 0),
      createdAt,
      isOnline: presence?.isOnline ?? false,
      onlineStatus: presence?.onlineStatus ?? 'offline',
      currentGameRoomId: presence?.currentGameRoomId ?? null,
      currentGameRoomLabel: presence?.currentGameRoomLabel ?? null,
      lastActiveAt: presence?.lastActiveAt ?? null,
    };
  }
}
