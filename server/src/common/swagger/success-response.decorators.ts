import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

type ResponseOptions = {
  description?: string;
  messageExample?: string;
};

function createEnvelopeSchema(
  dataSchema: Record<string, unknown>,
  messageExample = 'success',
) {
  return {
    type: 'object',
    properties: {
      code: {
        type: 'number',
        example: 0,
      },
      message: {
        type: 'string',
        example: messageExample,
      },
      data: dataSchema,
    },
    required: ['code', 'message', 'data'],
  };
}

function createListDataSchema(itemSchema: Record<string, unknown>) {
  return {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: itemSchema,
      },
      total: {
        type: 'number',
        example: 1,
      },
    },
    required: ['items', 'total'],
  };
}

function createPaginatedDataSchema(itemSchema: Record<string, unknown>) {
  return {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: itemSchema,
      },
      total: {
        type: 'number',
        example: 20,
      },
      page: {
        type: 'number',
        example: 1,
      },
      pageSize: {
        type: 'number',
        example: 10,
      },
      totalPages: {
        type: 'number',
        example: 2,
      },
    },
    required: ['items', 'total', 'page', 'pageSize', 'totalPages'],
  };
}

function createModelSchema(model: Type<unknown>) {
  return { $ref: getSchemaPath(model) };
}

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
