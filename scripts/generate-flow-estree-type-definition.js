import fs from "node:fs/promises";
import url from "node:url";
import { codeFrameColumns } from "@babel/code-frame";
import * as ts from "typescript";
import * as prettier from "../index.js";

const PROJECT_ROOT = new URL("../", import.meta.url);
const FLOW_TYPES = new URL(
  "./node_modules/hermes-estree/dist/types.js.flow",
  PROJECT_ROOT,
);
const FLOW_TYPES_DTS = new URL(
  "./src/language-js/types/flow-estree.d.ts",
  PROJECT_ROOT,
);

let text = await fs.readFile(FLOW_TYPES, "utf8");
text = toDts(text);

const getRelativePath = (url) =>
  new URL(url).href.slice(PROJECT_ROOT.href.length);
text = `
// ! Do NOT edit !
// Generated from '${getRelativePath(FLOW_TYPES)}'
// Run \`node ${getRelativePath(import.meta.url)}\` to update
// spell-checker: disable

${text}
`;

text = await prettier.format(text, {
  // Bug? should accept URL
  filepath: "flow-estree.d.ts",
  parser: "typescript",
});

await fs.writeFile(FLOW_TYPES_DTS, text);

const program = ts.createProgram([url.fileURLToPath(FLOW_TYPES_DTS)], {
  strict: true,
});
const diagnostics = ts.getPreEmitDiagnostics(program);

if (diagnostics.length > 0) {
  await fs.rm(FLOW_TYPES_DTS);
  const [diagnostic] = diagnostics;
  const { line, character: column } = ts.getLineAndCharacterOfPosition(
    diagnostic.file,
    diagnostic.start,
  );
  throw new Error(
    diagnostic.messageText +
      ":\n" +
      codeFrameColumns(
        text,
        { start: { line: line + 1, column } },
        {
          message: `TS${diagnostic.code}: ${diagnostic.messageText}`,
        },
      ),
  );
}

function toDts(text) {
  // Useless directive
  text = text.replaceAll("'use strict';", "  ");

  // `{+foo: string}` -> `{foo: string}`
  text = text.replaceAll(/(?<=\n)(?<indention>[ {2}]+)\+/gu, "$<indention>");

  // `{foo: interface {}}` -> `{foo: {}}`
  text = text.replaceAll(": interface {", ": {");

  // `{foo: interface extends T {}}` -> `{foo: T & {}}`
  text = text.replaceAll(
    /(?<=: )interface extends (?<type>\w+)(?= \{)/gu,
    "$<type> & ",
  );

  // `$ReadOnlyArray<?T>` -> `ReadonlyArray<T | null>`
  text = text.replaceAll(
    /\$ReadOnlyArray<\?(\w+)>/gu,
    "ReadonlyArray<$1 | null>",
  );

  // `$ReadOnlyArray<T>` -> `ReadonlyArray<T>`
  text = text.replaceAll("$ReadOnlyArray<", "ReadonlyArray<");

  // `$ReadOnly<T>` -> `Readonly<T>`
  text = text.replaceAll("$ReadOnly<", "Readonly<");

  // `{[string]: T}` -> `{[key: string]: T}`
  text = text.replaceAll(
    /(?<=\n)(?<indention>[ {2}]+)\[(?<type>string)\](?=: )/gu,
    "$<indention>[key: $<type>]",
  );

  return text;
}
