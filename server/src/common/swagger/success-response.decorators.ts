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
