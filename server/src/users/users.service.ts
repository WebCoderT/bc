import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { UserEntity } from './entities/user.entity';

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
      passwordHash: await bcrypt.hash(password, 10),
      role: Role.User,
    });

    return this.usersRepository.save(user);
  }

  findByUsername(username: string) {
    return this.usersRepository.findOne({ where: { username } });
  }

  findById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async listPublicUsers() {
    const users = await this.usersRepository.find({ order: { id: 'ASC' } });
    return users.map((user) => this.toSafeUser(user));
  }

  async updateRole(id: number, role: Role) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.role = role;
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
      role: user.role,
      createdAt,
    };
  }

  private async seedDefaultUsers() {
    const defaultUsers = [
      { username: 'normal_demo', password: 'User@123', role: Role.User },
      { username: 'vip_demo', password: 'Vip@123', role: Role.Vip },
      { username: 'admin_root', password: 'Admin@123', role: Role.Admin },
    ];

    for (const defaultUser of defaultUsers) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: defaultUser.username },
      });

      if (existingUser) {
        continue;
      }

      const user = this.usersRepository.create({
        username: defaultUser.username,
        passwordHash: await bcrypt.hash(defaultUser.password, 10),
        role: defaultUser.role,
      });

      await this.usersRepository.save(user);
    }
  }
}
