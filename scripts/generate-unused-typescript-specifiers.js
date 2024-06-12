import fs from "node:fs/promises";

import * as importMetaResolve from "import-meta-resolve";
import { outdent } from "outdent";
import * as typescript from "typescript";

import modifyTypescriptModule from "./build/modify-typescript-module.js";
import UNUSED_SPECIFIERS from "./build/typescript-unused-specifiers.js";

const FILE = new URL(
  "./build/typescript-unused-specifiers.js",
  import.meta.url,
);
const TYPESCRIPT_MODULE = new URL(
  importMetaResolve.resolve("typescript", import.meta.url),
);

async function getRemovedSpecifiers(code, exports) {
  const esbuild = await import("esbuild");

  let errors = [];
  try {
    await esbuild.transformSync(code, { loader: "js" });
    return;
  } catch (error) {
    ({ errors } = error);
  }

  const specifiers = [];
  for (const { text } of errors) {
    const match = text.match(
      /^"(?<variable>.*?)" is not declared in this file$/,
    );

    if (match) {
      const { specifier } = exports.find(
        ({ variable }) => variable === match.groups.variable,
      );
      specifiers.push(specifier);
    }
  }

  return specifiers;
}

async function main() {
  let text = await fs.readFile(TYPESCRIPT_MODULE, "utf8");
  text = modifyTypescriptModule(text);

  let specifiers = (await getRemovedSpecifiers(text)) ?? [];

  specifiers = [...new Set([...UNUSED_SPECIFIERS, ...specifiers])]
    .filter((specifier) => Object.hasOwn(typescript, specifier))
    .sort();

  await fs.writeFile(
    FILE,
    outdent`
      export default new Set(${JSON.stringify(specifiers, undefined, 2)})
    `,
  );
  console.log("typescript-unused-exports.js updated.");
}

await main();
