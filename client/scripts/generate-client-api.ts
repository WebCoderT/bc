import { generateApi } from "swagger-typescript-api";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const projectRoot = path.resolve(currentDirectoryPath, "..");

const swaggerUrl =
  process.env.CLIENT_SWAGGER_URL ?? "http://127.0.0.1:8000/docs/member-json";

const swaggerInput = process.env.CLIENT_SWAGGER_INPUT ?? null;

const publicSwaggerUrl =
  process.env.CLIENT_PUBLIC_SWAGGER_URL ??
  "http://127.0.0.1:8000/docs/public-json";

const publicSwaggerInput = process.env.CLIENT_PUBLIC_SWAGGER_INPUT ?? null;

async function generateSwaggerClient(
  source: { input?: string; url?: string },
  outputPath: string,
) {
  await generateApi({
    ...source,
    fileName: "index.ts",
    output: outputPath,
    httpClientType: "fetch",
    modular: true,
    generateClient: true,
    generateRouteTypes: true,
    generateResponses: true,
    extractRequestParams: true,
    extractRequestBody: true,
    extractResponseError: true,
    unwrapResponseData: false,
    cleanOutput: true,
    enumNamesAsValues: true,
    moduleNameFirstTag: true,
    singleHttpClient: true,
  });
}

async function main() {
  await generateSwaggerClient(
    swaggerInput ? { input: swaggerInput } : { url: swaggerUrl },
    path.resolve(projectRoot, "app/generated/api"),
  );

  await generateSwaggerClient(
    publicSwaggerInput
      ? { input: publicSwaggerInput }
      : { url: publicSwaggerUrl },
    path.resolve(projectRoot, "app/generated/public-api"),
  );

  console.log(
    `Client Swagger client generated from ${swaggerInput ?? swaggerUrl}`,
  );
  console.log(
    `Client Public Swagger client generated from ${publicSwaggerInput ?? publicSwaggerUrl}`,
  );
}

main().catch((error) => {
  console.error("Failed to generate client Swagger client.");
  console.error(error);
  process.exitCode = 1;
});
