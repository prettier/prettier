#!/usr/bin/env node

import fs from "node:fs/promises";
import url from "node:url";
import { codeFrameColumns } from "@babel/code-frame";
import * as ts from "typescript";
import * as prettier from "../node_modules/prettier/index.mjs";

const buildScriptVersion = "1";
const PROJECT_ROOT = new URL("../", import.meta.url);
const FLOW_TYPES = new URL(
  "./node_modules/flow-estree/dist/types.js.flow",
  PROJECT_ROOT,
);
const FLOW_TYPES_DTS = new URL(
  "./src/language-js/types/flow-estree.d.ts",
  PROJECT_ROOT,
);
const IS_CI = Boolean(process.env.CI);

async function generateFlowEstreeTypeDefinition() {
  const {
    default: { version },
  } = await import("flow-estree/package.json", {
    with: { type: "json" },
  });
  const versionComment = `// flow-estree:v${version}, build-script:v${buildScriptVersion}`;

  if (!IS_CI) {
    try {
      const dtsText = await fs.readFile(FLOW_TYPES_DTS, "utf8");
      if (dtsText.includes(versionComment + "\n")) {
        return;
      }
    } catch {
      // No op
    }
  }

  let text = await fs.readFile(FLOW_TYPES, "utf8");

  text = toDts(text);

  const getRelativePath = (url) =>
    new URL(url).href.slice(PROJECT_ROOT.href.length);
  text = `
// ! Do NOT edit !
// Generated from '${getRelativePath(FLOW_TYPES)}'
// Run \`node ${getRelativePath(import.meta.url)}\` to update
${versionComment}
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
}

function toDts(text) {
  // Useless directive
  text = text.replaceAll("'use strict';", "");

  // `{foo: interface {}}` -> `{foo: {}}`
  // `{foo: interface extends T {}}` -> `{foo: T & {}}`
  text = text.replaceAll(
    /(?<=: )interface(?: extends (?<type>\w+))?(?= \{)/g,
    (...args) => {
      const { type } = args.at(-1);
      return type ? `${type} & ` : "";
    },
  );

  // `ReadonlyArray<?T>` -> `ReadonlyArray<T | null>`
  text = text.replaceAll(
    /ReadonlyArray<\?(?<type>\w+)>/g,
    "ReadonlyArray<$<type> | null>",
  );

  // `{[string]: T}` -> `{[key: string]: T}`
  text = text.replaceAll(
    /(?<=\n[ {2}]+\[)(?<type>string)(?=\]: )/g,
    "key: $<type>",
  );

  return text;
}

await generateFlowEstreeTypeDefinition();
