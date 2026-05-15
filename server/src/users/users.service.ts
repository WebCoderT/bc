import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DataSource, Like, Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { DEFAULT_USER_AVATAR } from './default-avatar';
import { UserEntity } from './entities/user.entity';

type UpdateUserInput = {
  username: string;
  avatar: string;
  role: Role;
  rechargeAmount: number;
  bonusAmount: number;
  createdAt: string;
};

@Injectable()
export class UsersService implements OnModuleInit {
  private static seedPromise: Promise<void> | null = null;

  private readonly usersRepository: Repository<UserEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.usersRepository = this.dataSource.getRepository<UserEntity>('users');
  }

  async onModuleInit() {
    if (!UsersService.seedPromise) {
      UsersService.seedPromise = this.seedDefaultUsers();
    }

    await UsersService.seedPromise;
  }

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

  findByUsername(username: string) {
    return this.usersRepository.findOne({ where: { username } });
  }

  findById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

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

    return {
      items: users.map((user) => this.toSafeUser(user)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

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

  toSafeUser(user: UserEntity) {
    const createdAt =
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : new Date(user.createdAt).toISOString();

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
    };
  }

  private async seedDefaultUsers() {
    const defaultUsers = [
      {
        username: 'normal_demo',
        password: 'User@123',
        avatar: DEFAULT_USER_AVATAR,
        role: Role.User,
        rechargeAmount: 688,
        bonusAmount: 120,
      },
      {
        username: 'vip_demo',
        password: 'Vip@123',
        avatar: DEFAULT_USER_AVATAR,
        role: Role.Vip,
        rechargeAmount: 1588,
        bonusAmount: 300,
      },
      {
        username: 'admin_root',
        password: 'Admin@123',
        avatar: DEFAULT_USER_AVATAR,
        role: Role.Admin,
        rechargeAmount: 3888,
        bonusAmount: 888,
      },
    ];

    for (const defaultUser of defaultUsers) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: defaultUser.username },
      });

      if (existingUser) {
        let shouldSave = false;

        if ((existingUser.rechargeAmount ?? 0) === 0) {
          existingUser.rechargeAmount = defaultUser.rechargeAmount;
          shouldSave = true;
        }

        if ((existingUser.bonusAmount ?? 0) === 0) {
          existingUser.bonusAmount = defaultUser.bonusAmount;
          shouldSave = true;
        }

        if (!existingUser.avatar?.trim()) {
          existingUser.avatar = defaultUser.avatar;
          shouldSave = true;
        }

        if (shouldSave) {
          await this.usersRepository.save(existingUser);
        }

        continue;
      }

      const user = this.usersRepository.create({
        username: defaultUser.username,
        avatar: defaultUser.avatar,
        passwordHash: await bcrypt.hash(defaultUser.password, 10),
        role: defaultUser.role,
        rechargeAmount: defaultUser.rechargeAmount,
        bonusAmount: defaultUser.bonusAmount,
      });

      await this.usersRepository.save(user);
    }
  }
}
