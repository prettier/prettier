import fs from "node:fs";
import path from "node:path";
import url from "node:url";
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

async function buildPluginTypes({ file: { input, output } }) {
  const { default: plugin } = await import(
    url.pathToFileURL(path.join(PROJECT_ROOT, input))
  );

  await writeFile(
    path.join(DIST_DIR, output.file),
    outdent`
      import { Parser } from "../index.js";

      declare const plugin: {
        parsers: {
      ${Object.keys(plugin.parsers)
        .map(
          (parserName) =>
            `${" ".repeat(4)}${JSON.stringify(parserName)}: Parser;`
        )
        .join("\n")}
        };
      };

      export default plugin;
    ` + "\n"
  );
}

function buildTypes(options) {
  return options.file.isPlugin
    ? buildPluginTypes(options)
    : typesFileBuilder(options);
}

export default buildTypes;
