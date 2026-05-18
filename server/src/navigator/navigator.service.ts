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
import { resolveNavigationPath } from './utils/navigation-path.util';

@Injectable()
/**
 * 导航服务负责后台导航维护与前台导航可见性过滤。
 */
export class NavigatorService {
  /**
   * 导航服务直接操作导航实体仓储，负责后台维护与前台可见性过滤。
   */
  constructor(
    @InjectRepository(NavigationEntity)
    private readonly navigationRepository: Repository<NavigationEntity>,
  ) {}

  /**
   * 创建导航前先做输入标准化、父级校验与路径唯一性校验。
   */
  async create(createNavigatorDto: CreateNavigatorDto) {
    // 所有入口都先做 normalize，避免后续校验面对未经清洗的原始 DTO。
    const normalizedInput = this.normalizeInput(createNavigatorDto);
    const parent = await this.resolveParent(normalizedInput.parentId ?? null);
    await this.ensurePathUnique(normalizedInput.path);

    // 创建时统一以已校验过的父级结果回填 parentId，避免脏数据进入实体。
    const navigation = this.navigationRepository.create({
      ...normalizedInput,
      parentId: parent?.id ?? null,
    });

    const savedNavigation = await this.navigationRepository.save(navigation);

    return {
      message: '导航创建成功',
      navigation: this.toNavigationResponse(
        await this.findEntityOrFail(savedNavigation.id),
      ),
    };
  }

  async findAll(query?: ListNavigationsQueryDto) {
    // 管理员查询接口默认返回所有导航，包括隐藏的，前台接口会过滤掉隐藏的导航
    const navigations = await this.listNavigations(query, false);

    return createListResult(navigations);
  }

  /**
   * 会员端仅返回可见导航，并沿用统一的列表包装结构。
   * 这里不额外重写分页格式，避免后台和前台返回协议分叉。
   */
  async findAllForMember(query?: ListNavigationsQueryDto) {
    const navigations = await this.listNavigations(query, true);

    return createListResult(navigations);
  }

  /**
   * 后台查看单个导航时不做可见性过滤。
   * 后台管理需要看到隐藏节点，因此这里只校验记录是否存在。
   */
  async findOne(id: number) {
    const navigation = await this.findEntityOrFail(id);
    return this.toNavigationResponse(navigation);
  }

  /**
   * 前台查看单个导航时，当前节点和父节点都必须处于可见状态。
   */
  async findOneForMember(id: number) {
    // 详情接口复用后台查询，再叠加前台可见性限制。
    const navigation = await this.findEntityOrFail(id);

    if (!this.isVisibleNavigation(navigation)) {
      throw new NotFoundException('导航不存在');
    }

    if (navigation.parentId) {
      // 二级导航即使自身可见，父级被隐藏时也不能暴露给前台。
      const parent = await this.navigationRepository.findOne({
        where: { id: navigation.parentId },
      });

      if (parent && !this.isVisibleNavigation(parent)) {
        throw new NotFoundException('导航不存在');
      }
    }

    return this.toNavigationResponse(navigation);
  }

  /**
   * 更新时复用与创建一致的输入清洗和父级约束逻辑。
   * 这样可以把创建和编辑的约束保持在同一套规则里。
   */
  async update(id: number, updateNavigatorDto: UpdateNavigatorDto) {
    // 更新前先取出现有实体，用于局部更新时回填缺失字段。
    const navigation = await this.findEntityOrFail(id);
    const normalizedInput = this.normalizeInput(updateNavigatorDto, navigation);

    // 当前实现只允许两级结构，因此必须阻止节点挂到自身之下。
    if (normalizedInput.parentId === id) {
      throw new BadRequestException('导航不能将自身设为父级');
    }

    const parent = await this.resolveParent(normalizedInput.parentId ?? null);

    if (parent && parent.parentId) {
      throw new BadRequestException('仅支持二级导航配置');
    }

    await this.ensurePathUnique(normalizedInput.path, id);

    // 保留数据库实体实例，避免覆盖掉 TypeORM 维护的内部状态。
    Object.assign(navigation, {
      ...normalizedInput,
      parentId: parent?.id ?? null,
    });

    await this.navigationRepository.save(navigation);

    return {
      message: '导航更新成功',
      navigation: this.toNavigationResponse(await this.findEntityOrFail(id)),
    };
  }

  /**
   * 删除前先确认记录存在，保证错误语义一致。
   * 这样删除不存在节点时也会得到统一的 404 响应。
   */
  async remove(id: number) {
    // remove 使用实体删除，沿用 TypeORM 的级联与生命周期行为。
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
    // 关键字统一做去空格和小写化，便于对名称、路径、描述执行同口径匹配。
    // 这里不直接在 SQL 中做模糊查询，是因为后续还要在内存中重建两级树。
    const keyword = query?.keyword?.trim().toLowerCase();
    const navigationItems = await this.navigationRepository.find({
      order: {
        sort: 'ASC',
        id: 'ASC',
      },
    });

    // 前台场景要先过滤隐藏导航，后台场景保留完整结果。
    // 可见性过滤放在最前面，后续所有聚合都基于最终允许暴露的集合。
    const visibleItems = memberOnly
      ? navigationItems.filter((item) => this.isVisibleNavigation(item))
      : navigationItems;

    // 类型、状态、关键字过滤按固定顺序串联，保证结果可预期。
    // 顺序固定后，后续如果排查筛选问题也更容易定位每一步的输入输出。
    const typeFilteredItems = query?.type
      ? visibleItems.filter((item) => item.type === query.type)
      : visibleItems;

    const statusFilteredItems = query?.status
      ? typeFilteredItems.filter((item) => item.status === query.status)
      : typeFilteredItems;

    const keywordFilteredItems = keyword
      ? statusFilteredItems.filter((item) => this.matchesKeyword(item, keyword))
      : statusFilteredItems;

    // 指定父级时返回平铺结果，供后台表格或下拉选择直接消费。
    // 这种场景通常不需要整棵树，直接返回同级子节点更利于前端绑定表单。
    if (typeof query?.parentId === 'number') {
      return keywordFilteredItems
        .filter((item) => item.parentId === query.parentId)
        .map((item) => this.toNavigationResponse(item));
    }

    // 构造临时索引，用于把数据库平铺结果还原为两级树。
    // Map 键使用导航 id，能在挂载子节点时避免多次线性查找父节点。
    const itemMap = new Map(
      statusFilteredItems.map((item) => [
        item.id,
        {
          entity: item,
          children: [] as NavigationEntity[],
        },
      ]),
    );

    // 仅在索引中挂载已通过状态过滤的节点，避免隐藏节点污染树结构。
    // 由于当前只支持两级导航，这里不需要递归构造更深层树。
    for (const item of statusFilteredItems) {
      if (!item.parentId) {
        continue;
      }

      const parent = itemMap.get(item.parentId);

      if (parent) {
        parent.children.push(item);
      }
    }

    // 关键字过滤下，一级节点需要在自身命中或子节点命中时保留。
    // 这样用户搜索到某个二级导航时，前端仍然可以拿到它所属的一级分组。
    const matchedIds = new Set(keywordFilteredItems.map((item) => item.id));

    return (
      statusFilteredItems
        // 树形输出只从一级节点开始组装，二级节点统一挂在 children 上。
        .filter((item) => item.parentId === null)
        .filter((item) => {
          if (!keyword) {
            return true;
          }

          const rootNode = itemMap.get(item.id);
          // 一级命中直接保留；否则只要任一子节点命中也保留该一级节点。
          return (
            matchedIds.has(item.id) ||
            rootNode?.children.some((child) => matchedIds.has(child.id))
          );
        })
        .map((item) => {
          const rootNode = itemMap.get(item.id);
          const children = rootNode?.children ?? [];
          // 搜索场景只返回命中的子节点，避免无关二级导航干扰前端展示。
          const filteredChildren = keyword
            ? children.filter((child) => matchedIds.has(child.id))
            : children;

          return this.toNavigationResponse(item, filteredChildren);
        })
    );
  }

  /**
   * 查询实体时顺带加载 children，便于响应转换阶段直接生成树结构。
   * 这里固定对子节点排序，避免不同调用方读到的顺序不一致。
   */
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

  /**
   * 父级仅允许为空或一级导航，借此维持当前系统只支持两级菜单的约束。
   * 如果未来支持更深层级，应优先在这里统一放宽约束。
   */
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

  /**
   * path 作为导航访问标识，需要在全局范围内保持唯一。
   * 更新时允许命中自己，因此提供 currentId 排除当前记录。
   */
  private async ensurePathUnique(path: string | null, currentId?: number) {
    if (!path) {
      return;
    }

    const existingNavigation = await this.navigationRepository.findOne({
      where: { path },
    });

    if (existingNavigation && existingNavigation.id !== currentId) {
      throw new ConflictException('导航路径已存在');
    }
  }

  /**
   * 关键字匹配覆盖名称、路径和描述，兼顾后台检索体验。
   * filter(Boolean) 用来跳过空描述，避免对空值调用字符串方法。
   */
  private matchesKeyword(item: NavigationEntity, keyword: string) {
    return [
      item.name,
      resolveNavigationPath(item.id, item.path),
      item.description,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword));
  }

  /**
   * 前台可见性目前由状态字段单独控制，后续若有更多条件可集中扩展。
   * 统一封装成方法后，会员端列表和详情都能复用相同判定口径。
   */
  private isVisibleNavigation(item: NavigationEntity) {
    return item.status === NavigationStatus.Visible;
  }

  /**
   * 对创建和更新输入做统一收口，避免空字符串、未传字段和数据库旧值处理不一致。
   * fallback 主要用于更新场景，保证部分字段更新时不会把其余字段清空。
   */
  private normalizeInput(
    input: Partial<CreateNavigatorDto>,
    fallback?: Partial<NavigationEntity>,
  ) {
    const normalizedPath =
      typeof input.path === 'string'
        ? input.path.trim() || null
        : input.path === undefined
          ? (fallback?.path ?? null)
          : null;

    return {
      // 文本字段统一 trim，更新场景未传值时回退到原始实体值。
      name: input.name?.trim() || fallback?.name || '',
      path: normalizedPath,
      description: input.description?.trim() || fallback?.description || '',
      icon: input.icon?.trim() || fallback?.icon || '',
      type: input.type || fallback?.type,
      status: input.status || fallback?.status || NavigationStatus.Visible,
      sort:
        typeof input.sort === 'number'
          ? input.sort
          : Number(fallback?.sort ?? 0),
      parentId:
        // 显式传 null 表示解绑父级；未传时则沿用旧值。
        input.parentId === null
          ? null
          : typeof input.parentId === 'number'
            ? input.parentId
            : (fallback?.parentId ?? null),
    };
  }

  /**
   * 输出结构中统一补充层级、排序后的子节点以及 ISO 时间字符串。
   * 这里显式构造响应对象，避免直接把实体对象暴露给控制器层。
   */
  private toNavigationResponse(
    navigation: NavigationEntity,
    children: NavigationEntity[] = navigation.children ?? [],
  ) {
    return {
      // 基础字段保持与实体同名，减少前后端接口映射成本。
      id: navigation.id,
      name: navigation.name,
      path: resolveNavigationPath(navigation.id, navigation.path),
      description: navigation.description,
      icon: navigation.icon,
      type: navigation.type,
      status: navigation.status,
      // 数值字段在响应层转成 number，兼容数据库可能返回字符串的情况。
      sort: Number(navigation.sort ?? 0),
      parentId: navigation.parentId ?? null,
      // 当前导航结构限定为两层，因此 level 可由 parentId 直接推导。
      level: navigation.parentId ? 2 : 1,
      children: children
        // 子节点排序在响应层兜底执行，避免依赖上游调用方是否提前排好序。
        .sort((left, right) => left.sort - right.sort || left.id - right.id)
        .map((child) => this.toNavigationResponse(child, [])),
      createdAt:
        // 统一返回字符串，方便前端直接消费并减少时区序列化歧义。
        navigation.createdAt instanceof Date
          ? navigation.createdAt.toISOString()
          : new Date(navigation.createdAt).toISOString(),
      updatedAt:
        // updatedAt 与 createdAt 使用同一序列化策略，避免前端额外分支判断。
        navigation.updatedAt instanceof Date
          ? navigation.updatedAt.toISOString()
          : new Date(navigation.updatedAt).toISOString(),
    };
  }
}
