import fs from "node:fs/promises";
import esbuild from "esbuild";
import * as importMetaResolve from "import-meta-resolve";
import { outdent } from "outdent";
import * as prettier from "prettier";
import * as typescript from "typescript";
import { modifyTypescriptModule } from "./build/modify-typescript-module.js";
import UNUSED_SPECIFIERS from "./build/typescript-unused-specifiers.js";

async function getRemovedSpecifiers(code, exports) {
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
      /^"(?<variable>.*?)" is not declared in this file$/u,
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
  const original = await fs.readFile(
    new URL(importMetaResolve.resolve("typescript", import.meta.url)),
    "utf8",
  );
  const { code, exports } = modifyTypescriptModule(original);

  let specifiers = (await getRemovedSpecifiers(code, exports)) ?? [];

  specifiers = [...new Set([...UNUSED_SPECIFIERS, ...specifiers])]
    .filter((specifier) => Object.hasOwn(typescript, specifier))
    .sort();

  await fs.writeFile(
    new URL("./build/typescript-unused-specifiers.js", import.meta.url),
    await prettier.format(
      outdent`
        export default new Set(${JSON.stringify(specifiers, undefined, 2)});
      `,
      { parser: "meriyah" },
    ),
  );
  console.log("typescript-unused-specifiers.js updated.");
}

await main();
