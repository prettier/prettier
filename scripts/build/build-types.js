import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { PROJECT_ROOT, DIST_DIR, writeFile } from "../utils/index.mjs";
import { format } from "../../index.js";

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
  const plugin = await import(
    url.pathToFileURL(path.join(PROJECT_ROOT, input))
  );

  await writeFile(
    path.join(DIST_DIR, output.file),
    await format(
      /* indent */ `
        import { Parser } from "../index.js";

        export type plugins = {
        ${Object.keys(plugin.parsers)
          .map(
            (parserName) =>
              `${" ".repeat(4)}${JSON.stringify(parserName)}: Parser;`
          )
          .join("\n")}
        };
      `,
      { parser: "typescript" }
    )
  );
}

function buildTypes(options) {
  return options.file.isPlugin
    ? buildPluginTypes(options)
    : typesFileBuilder(options);
}

export default buildTypes;
