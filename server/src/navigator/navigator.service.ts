import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNavigatorDto } from './dto/create-navigator.dto';
import { ListNavigationsQueryDto } from './dto/list-navigations-query.dto';
import { UpdateNavigatorDto } from './dto/update-navigator.dto';
import { createListResult } from '../common/utils/pagination.util';
import { NavigationEntity } from './entities/navigator.entity';
import { NavigationStatus } from './enums/navigation-status.enum';
import { Repository } from 'typeorm';

@Injectable()
export class NavigatorService {
  constructor(
    @InjectRepository(NavigationEntity)
    private readonly navigationRepository: Repository<NavigationEntity>,
  ) {}

  async create(createNavigatorDto: CreateNavigatorDto) {
    const normalizedInput = this.normalizeInput(createNavigatorDto);
    const parent = await this.resolveParent(normalizedInput.parentId ?? null);
    await this.ensurePathUnique(normalizedInput.path);

    const navigation = this.navigationRepository.create({
      ...normalizedInput,
      parentId: parent?.id ?? null,
    });

    const savedNavigation = await this.navigationRepository.save(navigation);

    return {
      message: '导航创建成功',
      navigation: await this.findEntityOrFail(savedNavigation.id),
    };
  }

  async findAll(query?: ListNavigationsQueryDto) {
    const navigations = await this.listNavigations(query, false);

    return createListResult(navigations);
  }

  async findAllForMember(query?: ListNavigationsQueryDto) {
    const navigations = await this.listNavigations(query, true);

    return createListResult(navigations);
  }

  async findOne(id: number) {
    const navigation = await this.findEntityOrFail(id);
    return this.toNavigationResponse(navigation);
  }

  async findOneForMember(id: number) {
    const navigation = await this.findEntityOrFail(id);

    if (!this.isVisibleNavigation(navigation)) {
      throw new NotFoundException('导航不存在');
    }

    if (navigation.parentId) {
      const parent = await this.navigationRepository.findOne({
        where: { id: navigation.parentId },
      });

      if (parent && !this.isVisibleNavigation(parent)) {
        throw new NotFoundException('导航不存在');
      }
    }

    return this.toNavigationResponse(navigation);
  }

  async update(id: number, updateNavigatorDto: UpdateNavigatorDto) {
    const navigation = await this.findEntityOrFail(id);
    const normalizedInput = this.normalizeInput(updateNavigatorDto, navigation);

    if (normalizedInput.parentId === id) {
      throw new BadRequestException('导航不能将自身设为父级');
    }

    const parent = await this.resolveParent(normalizedInput.parentId ?? null);

    if (parent && parent.parentId) {
      throw new BadRequestException('仅支持二级导航配置');
    }

    await this.ensurePathUnique(normalizedInput.path, id);

    Object.assign(navigation, {
      ...normalizedInput,
      parentId: parent?.id ?? null,
    });

    await this.navigationRepository.save(navigation);

    return {
      message: '导航更新成功',
      navigation: await this.findEntityOrFail(id),
    };
  }

  async remove(id: number) {
    const navigation = await this.findEntityOrFail(id);

    await this.navigationRepository.remove(navigation);

    return {
      id,
      message: '导航删除成功',
    };
  }

  private async listNavigations(
    query: ListNavigationsQueryDto | undefined,
    memberOnly: boolean,
  ) {
    const keyword = query?.keyword?.trim().toLowerCase();
    const navigationItems = await this.navigationRepository.find({
      order: {
        sort: 'ASC',
        id: 'ASC',
      },
    });

    const visibleItems = memberOnly
      ? navigationItems.filter((item) => this.isVisibleNavigation(item))
      : navigationItems;

    const typeFilteredItems = query?.type
      ? visibleItems.filter((item) => item.type === query.type)
      : visibleItems;

    const statusFilteredItems = query?.status
      ? typeFilteredItems.filter((item) => item.status === query.status)
      : typeFilteredItems;

    const keywordFilteredItems = keyword
      ? statusFilteredItems.filter((item) => this.matchesKeyword(item, keyword))
      : statusFilteredItems;

    if (typeof query?.parentId === 'number') {
      return keywordFilteredItems
        .filter((item) => item.parentId === query.parentId)
        .map((item) => this.toNavigationResponse(item));
    }

    const itemMap = new Map(
      statusFilteredItems.map((item) => [
        item.id,
        {
          entity: item,
          children: [] as NavigationEntity[],
        },
      ]),
    );

    for (const item of statusFilteredItems) {
      if (!item.parentId) {
        continue;
      }

      const parent = itemMap.get(item.parentId);

      if (parent) {
        parent.children.push(item);
      }
    }

    const matchedIds = new Set(keywordFilteredItems.map((item) => item.id));

    return statusFilteredItems
      .filter((item) => item.parentId === null)
      .filter((item) => {
        if (!keyword) {
          return true;
        }

        const rootNode = itemMap.get(item.id);
        return (
          matchedIds.has(item.id) ||
          rootNode?.children.some((child) => matchedIds.has(child.id))
        );
      })
      .map((item) => {
        const rootNode = itemMap.get(item.id);
        const children = rootNode?.children ?? [];
        const filteredChildren = keyword
          ? children.filter((child) => matchedIds.has(child.id))
          : children;

        return this.toNavigationResponse(item, filteredChildren);
      });
  }

  private async findEntityOrFail(id: number) {
    const navigation = await this.navigationRepository.findOne({
      where: { id },
      relations: { children: true },
      order: {
        children: {
          sort: 'ASC',
          id: 'ASC',
        },
      },
    });

    if (!navigation) {
      throw new NotFoundException('导航不存在');
    }

    return navigation;
  }

  private async resolveParent(parentId: number | null) {
    if (parentId === null || parentId === undefined) {
      return null;
    }

    const parent = await this.navigationRepository.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('父级导航不存在');
    }

    if (parent.parentId) {
      throw new BadRequestException('仅支持二级导航配置');
    }

    return parent;
  }

  private async ensurePathUnique(path: string, currentId?: number) {
    const existingNavigation = await this.navigationRepository.findOne({
      where: { path },
    });

    if (existingNavigation && existingNavigation.id !== currentId) {
      throw new ConflictException('导航路径已存在');
    }
  }

  private matchesKeyword(item: NavigationEntity, keyword: string) {
    return [item.name, item.path, item.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword));
  }

  private isVisibleNavigation(item: NavigationEntity) {
    return item.status === NavigationStatus.Visible;
  }

  private normalizeInput(
    input: Partial<CreateNavigatorDto>,
    fallback?: Partial<NavigationEntity>,
  ) {
    return {
      name: input.name?.trim() || fallback?.name || '',
      path: input.path?.trim() || fallback?.path || '',
      description: input.description?.trim() || fallback?.description || '',
      icon: input.icon?.trim() || fallback?.icon || '',
      type: input.type || fallback?.type,
      status: input.status || fallback?.status || NavigationStatus.Visible,
      sort:
        typeof input.sort === 'number'
          ? input.sort
          : Number(fallback?.sort ?? 0),
      parentId:
        input.parentId === null
          ? null
          : typeof input.parentId === 'number'
            ? input.parentId
            : (fallback?.parentId ?? null),
    };
  }

  private toNavigationResponse(
    navigation: NavigationEntity,
    children: NavigationEntity[] = navigation.children ?? [],
  ) {
    return {
      id: navigation.id,
      name: navigation.name,
      path: navigation.path,
      description: navigation.description,
      icon: navigation.icon,
      type: navigation.type,
      status: navigation.status,
      sort: Number(navigation.sort ?? 0),
      parentId: navigation.parentId ?? null,
      level: navigation.parentId ? 2 : 1,
      children: children
        .sort((left, right) => left.sort - right.sort || left.id - right.id)
        .map((child) => this.toNavigationResponse(child, [])),
      createdAt:
        navigation.createdAt instanceof Date
          ? navigation.createdAt.toISOString()
          : new Date(navigation.createdAt).toISOString(),
      updatedAt:
        navigation.updatedAt instanceof Date
          ? navigation.updatedAt.toISOString()
          : new Date(navigation.updatedAt).toISOString(),
    };
  }
}
