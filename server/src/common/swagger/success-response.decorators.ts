import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  createEnvelopeSchema,
  createListDataSchema,
  createModelSchema,
  createPaginatedDataSchema,
} from './response-schema.factory';

type ResponseOptions = {
  description?: string;
  messageExample?: string;
};

/**
 * 声明标准成功响应装饰器，data 为单模型对象。
 */
export function ApiOkDataResponse(
  model: Type<unknown>,
  options?: ResponseOptions,
): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: options?.description,
      schema: createEnvelopeSchema(
        createModelSchema(model),
        options?.messageExample,
      ),
    }),
  );
}

/**
 * 声明标准创建成功响应装饰器，data 为单模型对象。
 */
export function ApiCreatedDataResponse(
  model: Type<unknown>,
  options?: ResponseOptions,
): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(model),
    ApiCreatedResponse({
      description: options?.description,
      schema: createEnvelopeSchema(
        createModelSchema(model),
        options?.messageExample,
      ),
    }),
  );
}

/**
 * 声明标准列表响应装饰器，data 为列表结构。
 */
export function ApiOkListResponse(
  model: Type<unknown>,
  options?: ResponseOptions,
): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: options?.description,
      schema: createEnvelopeSchema(
        createListDataSchema(createModelSchema(model)),
        options?.messageExample,
      ),
    }),
  );
}

/**
 * 声明标准分页响应装饰器，data 为分页结构。
 */
export function ApiOkPaginatedResponse(
  model: Type<unknown>,
  options?: ResponseOptions,
): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: options?.description,
      schema: createEnvelopeSchema(
        createPaginatedDataSchema(createModelSchema(model)),
        options?.messageExample,
      ),
    }),
  );
}

/**
 * 声明字符串列表成功响应装饰器。
 */
export function ApiOkStringListResponse(
  options?: ResponseOptions,
): MethodDecorator {
  return ApiOkResponse({
    description: options?.description,
    schema: createEnvelopeSchema(
      createListDataSchema({
        type: 'string',
        example: '支持普通用户注册与登录',
      }),
      options?.messageExample,
    ),
  });
}
