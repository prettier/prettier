import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { isValidIdentifier } from "@babel/types";
import { outdent } from "outdent";
import { PROJECT_ROOT, DIST_DIR, writeFile } from "../utils/index.mjs";

async function typesFileBuilder({ file }) {
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
    text = text.replaceAll(
      new RegExp(` from "${from}";`, "g"),
      ` from "${to}";`
    );
  }
  await writeFile(path.join(DIST_DIR, file.output.file), text);
}

function toPropertyKey(name) {
  return isValidIdentifier(name) ? name : JSON.stringify(name);
}

async function buildPluginTypes({ file: { input, output } }) {
  const plugin = await import(
    url.pathToFileURL(path.join(PROJECT_ROOT, input))
  );

  let code = "";

  // We only export `parsers`, printers should not be used alone
  // For `estree` plugin, we just write an empty file
  if (plugin.parsers) {
    code =
      outdent`
        import { Parser } from "../index.js";

        export declare const parsers: {
        ${Object.keys(plugin.parsers)
          .map(
            (parserName) =>
              `${" ".repeat(2)}${toPropertyKey(parserName)}: Parser;`
          )
          .join("\n")}
        };
      ` + "\n";
  }

  await writeFile(path.join(DIST_DIR, output.file), code);
}

function buildTypes(options) {
  return options.file.isPlugin
    ? buildPluginTypes(options)
    : typesFileBuilder(options);
}

export default buildTypes;
