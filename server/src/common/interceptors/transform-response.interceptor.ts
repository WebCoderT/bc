import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiListData,
  ApiPaginatedData,
  ApiSuccessResponse,
} from '../interfaces/api-response.interface';

type PlainObject = Record<string, unknown>;

@Injectable()
/**
 * 响应拦截器负责把控制器返回值统一包装为标准成功响应结构。
 */
export class TransformResponseInterceptor implements NestInterceptor<
  unknown,
  ApiSuccessResponse<unknown>
> {
  /**
   * 拦截控制器输出，并将其转换为统一的响应格式。
   */
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<unknown>> {
    return next.handle().pipe(map((payload) => this.transformPayload(payload)));
  }

  /**
   * 统一生成标准成功响应对象。
   */
  private transformPayload(payload: unknown): ApiSuccessResponse<unknown> {
    return {
      code: 0,
      message: this.extractMessage(payload),
      data: this.extractData(payload),
    };
  }

  /**
   * 从原始载荷中提取 message 字段，缺失时回退为默认成功消息。
   */
  private extractMessage(payload: unknown) {
    if (!this.isPlainObject(payload)) {
      return 'success';
    }

    return typeof payload.message === 'string' ? payload.message : 'success';
  }

  /**
   * 从原始载荷中提取 data 主体，并兼容列表、分页和简单对象场景。
   */
  private extractData(payload: unknown): unknown {
    if (!this.isPlainObject(payload)) {
      return payload ?? null;
    }

    const rest = Object.fromEntries(
      Object.entries(payload).filter(([key]) => key !== 'message'),
    );

    if (this.isPaginatedResult(rest)) {
      return {
        items: rest.items,
        total: rest.total,
        page: rest.page,
        pageSize: rest.pageSize,
        totalPages: rest.totalPages,
      } satisfies ApiPaginatedData<unknown>;
    }

    if (this.isListResult(rest)) {
      return {
        items: rest.items,
        total: typeof rest.total === 'number' ? rest.total : rest.items.length,
      } satisfies ApiListData<unknown>;
    }

    const keys = Object.keys(rest);

    if (keys.length === 1) {
      const firstValue = rest[keys[0]];

      if (this.isPlainObject(firstValue) && 'id' in firstValue) {
        return firstValue;
      }
    }

    if (keys.length === 0) {
      return null;
    }

    return rest;
  }

  /**
   * 判断值是否为普通对象。
   */
  private isPlainObject(value: unknown): value is PlainObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * 判断对象是否符合列表结构。
   */
  private isListResult(
    value: PlainObject,
  ): value is { items: unknown[]; total?: number } {
    return Array.isArray(value.items);
  }

  /**
   * 判断对象是否符合分页结构。
   */
  private isPaginatedResult(value: PlainObject): value is {
    items: unknown[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    return (
      Array.isArray(value.items) &&
      typeof value.total === 'number' &&
      typeof value.page === 'number' &&
      typeof value.pageSize === 'number' &&
      typeof value.totalPages === 'number'
    );
  }
}
