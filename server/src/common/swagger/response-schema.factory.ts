import { Type } from '@nestjs/common';
import { getSchemaPath } from '@nestjs/swagger';
import type {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

type SwaggerSchema = SchemaObject | ReferenceObject;

export function createEnvelopeSchema(
  dataSchema: SwaggerSchema,
  messageExample = 'success',
): SchemaObject {
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

export function createListDataSchema(itemSchema: SwaggerSchema): SchemaObject {
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

export function createPaginatedDataSchema(
  itemSchema: SwaggerSchema,
): SchemaObject {
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

export function createModelSchema(model: Type<unknown>): ReferenceObject {
  return { $ref: getSchemaPath(model) };
}
