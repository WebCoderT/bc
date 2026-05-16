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
export class TransformResponseInterceptor implements NestInterceptor<
  unknown,
  ApiSuccessResponse<unknown>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<unknown>> {
    return next.handle().pipe(map((payload) => this.transformPayload(payload)));
  }

  private transformPayload(payload: unknown): ApiSuccessResponse<unknown> {
    return {
      code: 0,
      message: this.extractMessage(payload),
      data: this.extractData(payload),
    };
  }

  private extractMessage(payload: unknown) {
    if (!this.isPlainObject(payload)) {
      return 'success';
    }

    return typeof payload.message === 'string' ? payload.message : 'success';
  }

  private extractData(payload: unknown): unknown {
    if (!this.isPlainObject(payload)) {
      return payload ?? null;
    }

    const { message: _message, ...rest } = payload;

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

  private isPlainObject(value: unknown): value is PlainObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private isListResult(
    value: PlainObject,
  ): value is { items: unknown[]; total?: number } {
    return Array.isArray(value.items);
  }

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
