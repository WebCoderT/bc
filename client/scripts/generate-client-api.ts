import { generateApi } from "swagger-typescript-api";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const projectRoot = path.resolve(currentDirectoryPath, "..");

const swaggerUrl =
  process.env.CLIENT_SWAGGER_URL ?? "http://127.0.0.1:8000/docs/member-json";

async function main() {
  await generateApi({
    url: swaggerUrl,
    fileName: "index.ts",
    output: path.resolve(projectRoot, "app/generated/api"),
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

  console.log(`Client Swagger client generated from ${swaggerUrl}`);
}

main().catch((error) => {
  console.error("Failed to generate client Swagger client.");
  console.error(error);
  process.exitCode = 1;
});
