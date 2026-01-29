import path from "node:path";
import url from "node:url";
import { FORMAT_SCRIPT_FILENAME } from "./constants.js";
import { getFixtures } from "./get-fixtures.js";
import { getParsers } from "./get-parsers.js";
import { testFixture } from "./run-test.js";
import { stringifyOptionsForTitle } from "./stringify-options-for-title.js";
import {
  isErrorTest as isErrorTestDirectory,
  normalizeDirectory,
} from "./utilities.js";
import { verifyParsers } from "./verify-fixtures.js";

/**
@typedef {
  | string
  | { code: string; name?: string; filename?: string; output?: string }
} Snippet
@typedef {{
  dirname: string,
  stringifiedOptions: string,
  parsers: string[],
  options: any,
  explicitParsers: string[],
  rawOptions: any,
  snippets: Snippet[],
}} Context
*/

/**
@param {
  | ImportMeta
  | { importMeta: ImportMeta, snippets?: Snippet[] }
} rawFixtures
@param {string[]} explicitParsers
@param {any} rawOptions
*/
function runFormatTest(rawFixtures, explicitParsers, rawOptions) {
  const { importMeta, snippets = [] } = rawFixtures.importMeta
    ? rawFixtures
    : { importMeta: rawFixtures };

  const filename = path.basename(new URL(importMeta.url).pathname);
  if (filename !== FORMAT_SCRIPT_FILENAME) {
    throw new Error(
      `Format test should run in file named '${FORMAT_SCRIPT_FILENAME}'.`,
    );
  }

  const dirname = normalizeDirectory(
    path.dirname(url.fileURLToPath(importMeta.url)),
  );

  let options = {
    printWidth: 80,
    ...rawOptions,
  };

  // `IS_ERROR_TEST` mean to watch errors like:
  // - syntax parser hasn't supported yet
  // - syntax errors that should throws
  const isErrorTest = isErrorTestDirectory(dirname);

  if (isErrorTest) {
    options = { errors: true, ...options };
  }

  // Make sure tests are in correct location

  const context = {
    isErrorTest,
    dirname,
    stringifiedOptions: stringifyOptionsForTitle(rawOptions),
    parsers: getParsers(dirname, explicitParsers),
    options,
    explicitParsers,
    rawOptions,
    snippets,
  };

  verifyParsers(context);

  for (const fixture of getFixtures(context)) {
    testFixture(fixture);
  }
}

export { runFormatTest };
