import path from "node:path";
import url from "node:url";
import outdent from "outdent";
import * as docPublicApis from "../../src/document/public.js";
import { PROJECT_ROOT } from "../utils/index.mjs";

async function reuseDocumentModule() {
  const modules = ["builders", "printer", "utils", "debug"];
  const publicApisPath = path.join(PROJECT_ROOT, "src/document/public.js");
  const publicApis = await import(url.pathToFileURL(publicApisPath));
  const parts = [
    `import { ${modules.join(", ")} } from ${JSON.stringify(publicApisPath)};`,
  ];

  for (const module of modules) {
    const modulePath = path.join(PROJECT_ROOT, `src/document/${module}.js`);
    const objects = await import(url.pathToFileURL(modulePath));
    for (const [name, value] of Object.entries(objects)) {
      parts.push(
        value === publicApis[module][name]
          ? `export const { ${name} } = ${module};`
          : `export { ${name} } from ${JSON.stringify(modulePath)};`
      );
    }
  }

  const code = parts.join("\n");

  return [
    ...modules.map((module) => ({
      module: path.join(PROJECT_ROOT, `src/document/${module}.js`),
      path: path.join(PROJECT_ROOT, "src/document/all.js"),
    })),
    {
      module: path.join(PROJECT_ROOT, "src/document/all.js"),
      text: code,
    },
  ];
}

export default reuseDocumentModule;
