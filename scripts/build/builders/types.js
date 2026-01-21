import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { isValidIdentifier } from "@babel/types";
import { outdent } from "outdent";
import { writeFile } from "../../utilities/index.js";

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

  await writeFile(path.join(packageConfig.distDirectory, file.output), text);
}

function toPropertyKey(name) {
  return isValidIdentifier(name) ? name : JSON.stringify(name);
}

async function buildPluginTypes({ packageConfig, file: { input, output } }) {
  const pluginModule = await import(
    url.pathToFileURL(path.join(packageConfig.sourceDirectory, input))
  );
  const plugin = pluginModule.default ?? pluginModule;
  const parserNames = Object.keys(plugin.parsers ?? {});
  const printerNames = Object.keys(plugin.printers ?? {});
  const typesImportPath =
    packageConfig.packageName === "prettier" ? "../index.js" : "prettier";

  // Export available `parsers` and `printers` as types. If none are available,
  // export an empty module object to ensure the file is treated as a module
  const types = [];
  const declarations = [];

  if (parserNames.length > 0) {
    types.push("Parser");
    declarations.push(
      outdent`
        export declare const parsers: {
        ${parserNames
          .map(
            (parserName) =>
              `${" ".repeat(2)}${toPropertyKey(parserName)}: Parser;`,
          )
          .join("\n")}
        };
      `.trim(),
    );
  }

  if (printerNames.length > 0) {
    types.push("Printer");
    declarations.push(
      outdent`
        export declare const printers: {
        ${printerNames
          .map(
            (printerName) =>
              `${" ".repeat(2)}${toPropertyKey(printerName)}: Printer;`,
          )
          .join("\n")}
        };
      `.trim(),
    );
  }

  const code =
    declarations.length === 0
      ? "export {};"
      : [
          `import { ${types.join(", ")} } from "${typesImportPath}";`,
          "",
          declarations.join("\n\n"),
        ].join("\n");

  await writeFile(path.join(packageConfig.distDirectory, output), `${code}\n`);
}

function createTypesBuilder({ isPlugin }) {
  return isPlugin ? buildPluginTypes : typesFileBuilder;
}

export { createTypesBuilder };
