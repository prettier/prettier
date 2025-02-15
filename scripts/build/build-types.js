import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { isValidIdentifier } from "@babel/types";
import { outdent } from "outdent";
import { PROJECT_ROOT, writeFile } from "../utils/index.js";

async function typesFileBuilder({ packageConfig, file }) {
  /**
   * @typedef {{ from: string, to: string }} ImportPathReplacement
   * @typedef {{ [input: string]: Array<ImportPathReplacement> }} ReplacementMap
   */

  /** @type {ReplacementMap} */
  const pathReplacementMap = {
    "src/index.d.ts": [{ from: "./document/public.js", to: "./doc.js" }],
  };
  const replacements = pathReplacementMap[file.input] ?? [];
  let text = await fs.promises.readFile(file.input, "utf8");
  for (const { from, to } of replacements) {
    text = text.replaceAll(` from "${from}";`, ` from "${to}";`);
  }
  await writeFile(
    path.join(packageConfig.distDirectory, file.output.file),
    text,
  );
}

function toPropertyKey(name) {
  return isValidIdentifier(name) ? name : JSON.stringify(name);
}

async function buildPluginTypes({ packageConfig, file: { input, output } }) {
  const pluginModule = await import(
    url.pathToFileURL(path.join(PROJECT_ROOT, input))
  );
  const plugin = pluginModule.default ?? pluginModule;
  const parserNames = Object.keys(plugin.parsers ?? {});

  // We only add `parsers` to types file, printers should not be used alone
  // For `estree` plugin, we just export an empty object to ensure it treated as a module
  const code =
    parserNames.length === 0
      ? "export {};"
      : outdent`
        import { Parser } from "../index.js";

        export declare const parsers: {
        ${parserNames
          .map(
            (parserName) =>
              `${" ".repeat(2)}${toPropertyKey(parserName)}: Parser;`,
          )
          .join("\n")}
        };
      `;

  await writeFile(
    path.join(packageConfig.distDirectory, output.file),
    `${code}\n`,
  );
}

function buildTypes(options) {
  return options.file.isPlugin
    ? buildPluginTypes(options)
    : typesFileBuilder(options);
}

export default buildTypes;
