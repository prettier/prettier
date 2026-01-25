import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import createEsmUtils from "esm-utils";
import * as failedTests from "./failed-format-tests.js";
import getPrettier from "./get-prettier.js";
import checkParsers from "./utilities/check-parsers.js";
import consistentEndOfLine from "./utilities/consistent-end-of-line.js";
import createSnapshot from "./utilities/create-snapshot.js";
import stringifyOptionsForTitle from "./utilities/stringify-options-for-title.js";
import visualizeEndOfLine from "./utilities/visualize-end-of-line.js";

const { __dirname } = createEsmUtils(import.meta);

const { FULL_TEST, TEST_STANDALONE, NODE_ENV, TEST_RUNTIME } = process.env;
const isProduction = NODE_ENV === "production";
const BOM = "\uFEFF";

const CURSOR_PLACEHOLDER = "<|>";
const RANGE_START_PLACEHOLDER = "<<<PRETTIER_RANGE_START>>>";
const RANGE_END_PLACEHOLDER = "<<<PRETTIER_RANGE_END>>>";

const shouldThrowOnFormat = (filename, options, parser) => {
  const { errors = {} } = options;
  if (errors === true) {
    return true;
  }

  const files = errors[parser];

  if (files === true || (Array.isArray(files) && files.includes(filename))) {
    return true;
  }

  return false;
};

const isTestDirectory = (dirname, name) =>
  (dirname + path.sep).startsWith(
    path.join(__dirname, "../format", name) + path.sep,
  );

const ensurePromise = (value) => {
  const isPromise = TEST_STANDALONE
    ? // In standalone test, promise is from another context
      Object.prototype.toString.call(value) === "[object Promise]"
    : value instanceof Promise;

  if (!isPromise) {
    throw new TypeError("Expected value to be a 'Promise'.");
  }

  return value;
};

function runFormatTest(fixtures, parsers, options = {}) {
  let { importMeta, snippets = [] } = fixtures.importMeta
    ? fixtures
    : { importMeta: fixtures };

  const filename = path.basename(new URL(importMeta.url).pathname);
  if (filename !== "format.test.js") {
    throw new Error(`Format test should run in file named 'format.test.js'.`);
  }

  const dirname = path.dirname(url.fileURLToPath(importMeta.url));

  // `IS_ERROR_TEST` mean to watch errors like:
  // - syntax parser hasn't supported yet
  // - syntax errors that should throws
  const IS_ERROR_TEST = dirname.includes(`${path.sep}_errors${path.sep}`);
  if (IS_ERROR_TEST) {
    options = { errors: true, ...options };
  }

  snippets = snippets.map((test, index) => {
    test = typeof test === "string" ? { code: test } : test;

    if (typeof test.code !== "string") {
      throw Object.assign(new Error("Invalid test"), { test });
    }

    return {
      ...test,
      name: `snippet: ${test.name || `#${index}`}`,
    };
  });

  const files = fs
    .readdirSync(dirname, { withFileTypes: true })
    .map((file) => {
      const basename = file.name;
      const filename = path.join(dirname, basename);
      if (
        path.extname(basename) === ".snap" ||
        !file.isFile() ||
        basename[0] === "." ||
        basename === "format.test.js" ||
        // VSCode creates this file sometime https://github.com/microsoft/vscode/issues/105191
        basename === "debug.log"
      ) {
        return;
      }

      const text = fs.readFileSync(filename, "utf8");

      return {
        name: basename,
        filename,
        code: text,
      };
    })
    .filter(Boolean);

  // Make sure tests are in correct location
  if (process.env.CHECK_TEST_PARSERS) {
    if (!Array.isArray(parsers) || parsers.length === 0) {
      throw new Error(`No parsers were specified for ${dirname}`);
    }
    checkParsers({ dirname, files }, parsers);
  }

  const allParsers = [...parsers];
  const addParsers = (...parsers) => {
    if (IS_ERROR_TEST) {
      return;
    }

    for (const parser of parsers) {
      if (
        !allParsers.includes(parser) &&
        !failedTests.shouldDisable(dirname, parser)
      ) {
        allParsers.push(parser);
      }
    }
  };

  if (
    parsers.includes("babel") &&
    (isTestDirectory(dirname, "js") || isTestDirectory(dirname, "jsx"))
  ) {
    addParsers("acorn", "espree", "meriyah", "oxc");
  }

  if (parsers.includes("typescript")) {
    addParsers("babel-ts", "oxc-ts");
  }

  if (parsers.includes("flow")) {
    addParsers("hermes");
  }

  if (parsers.includes("babel")) {
    addParsers("__babel_estree");
  }

  const stringifiedOptions = stringifyOptionsForTitle(options);

  for (const { name, filename, code, output } of [...files, ...snippets]) {
    const title = `${name}${
      stringifiedOptions ? ` - ${stringifiedOptions}` : ""
    }`;

    describe(title, () => {
      const basicOptions = {
        printWidth: 80,
        filepath: filename,
        ...options,
      };
      const parsersToTest = allParsers.filter(
        (parser) => !failedTests.shouldDisable(filename, parser),
      );
      const mainParser = parsersToTest.find(
        (parser) => !shouldThrowOnFormat(name, options, parser),
      );

      let results;
      let firstSucceedResult;
      beforeAll(async () => {
        const formatResults = await Promise.all(
          parsersToTest.map(async (parser) => {
            const formatOptions = { ...basicOptions, parser };
            const expectFail = shouldThrowOnFormat(name, options, parser);
            const runFormat = () => format(code, formatOptions);
            const result = {
              parser,
              code,
              formatOptions,
              expectFail,
              expectedOutput: output,
            };

            if (expectFail) {
              result.runFormat = runFormat;
              return result;
            }

            try {
              result.formatResult = await runFormat();
            } catch (error) {
              result.error = error;
            }

            return result;
          }),
        );

        firstSucceedResult = formatResults.find(({ formatResult }) =>
          Boolean(formatResult),
        );
        results = new Map(
          formatResults.map((formatResult) => [
            formatResult.parser,
            formatResult,
          ]),
        );
      });

      for (const parser of parsersToTest) {
        const testTitle =
          parser !== mainParser ? `[${parser}] format` : "format";

        test(testTitle, async () => {
          await runTest({
            parsers,
            filename,
            code,
            output,
            result: results.get(parser),
            succeedResult: firstSucceedResult,
          });
        });
      }
    });
  }
}

async function runTest({
  parsers,
  filename,
  code,
  output,
  result,
  succeedResult,
}) {
  if (result.expectFail) {
    await expect(result.runFormat).rejects.toThrowErrorMatchingSnapshot();
    return;
  }

  const { error, formatResult } = result;
  if (!formatResult) {
    throw error;
  }

  expect(formatResult).toBeDefined();
  expect(succeedResult.formatResult).toBeDefined();

  // Make sure output has consistent EOL
  expect(formatResult.eolVisualizedOutput).toBe(
    visualizeEndOfLine(consistentEndOfLine(formatResult.outputWithCursor)),
  );

  if (typeof result.expectedOutput === "string") {
    expect(formatResult.eolVisualizedOutput).toBe(visualizeEndOfLine(output));
  } else if (succeedResult === result) {
    expect(
      createSnapshot(formatResult, {
        parsers,
        formatOptions: result.formatOptions,
        CURSOR_PLACEHOLDER,
      }),
    ).toMatchSnapshot();
  } else {
    expect(formatResult.eolVisualizedOutput).toStrictEqual(
      succeedResult.formatResult.eolVisualizedOutput,
    );
  }

  if (!FULL_TEST) {
    return;
  }

  const { formatOptions } = result;

  // Some parsers skip parsing empty files
  if (formatResult.changed && code.trim()) {
    const { input, output } = formatResult;
    const [originalAst, formattedAst] = await Promise.all(
      [input, output].map((code) => parse(code, formatOptions)),
    );
    const isAstUnstableTest = failedTests.isAstUnstable(
      filename,
      formatOptions,
    );

    if (isAstUnstableTest) {
      expect(formattedAst).not.toStrictEqual(originalAst);
    } else {
      expect(formattedAst).toStrictEqual(originalAst);
    }
  }

  if (succeedResult === result) {
    return;
  }

  const isUnstableTest = failedTests.isUnstable(filename, formatOptions);
  if (
    (formatResult.changed || isUnstableTest) &&
    // No range and cursor
    formatResult.input === code
  ) {
    const { eolVisualizedOutput: firstOutput, output } = formatResult;
    const { eolVisualizedOutput: secondOutput } = await format(
      output,
      formatOptions,
    );
    if (isUnstableTest) {
      if (secondOutput === firstOutput) {
        throw new Error(
          `Unstable file '${filename}' is stable now, please remove from the 'unstableTests' list.`,
        );
      }

      // To keep eye on failed tests, this assert never supposed to pass,
      // if it fails, just remove the file from `unstableTests`
      expect(secondOutput).not.toBe(firstOutput);
    } else {
      expect(secondOutput).toBe(firstOutput);
    }
  }

  if (!shouldSkipEolTest(code, formatResult.options)) {
    await Promise.all(
      ["\r\n", "\r"].map(async (eol) => {
        const { eolVisualizedOutput: output } = await format(
          code.replace(/\n/g, eol),
          formatOptions,
        );
        // Only if `endOfLine: "auto"` the result will be different
        const expected =
          formatOptions.endOfLine === "auto"
            ? visualizeEndOfLine(
                // All `code` use `LF`, so the `eol` of result is always `LF`
                formatResult.outputWithCursor.replace(/\n/g, eol),
              )
            : formatResult.eolVisualizedOutput;

        expect(output).toBe(expected);
      }),
    );
  }

  if (code.charAt(0) !== BOM) {
    const { eolVisualizedOutput: output } = await format(
      BOM + code,
      formatOptions,
    );
    const expected = BOM + formatResult.eolVisualizedOutput;
    expect(output).toBe(expected);
  }
}

function shouldSkipEolTest(code, options) {
  if (code.includes("\r")) {
    return true;
  }
  const { requirePragma, checkIgnorePragma, rangeStart, rangeEnd } = options;
  if (requirePragma || checkIgnorePragma) {
    return true;
  }

  if (
    typeof rangeStart === "number" &&
    typeof rangeEnd === "number" &&
    rangeStart >= rangeEnd
  ) {
    return true;
  }
  return false;
}

async function parse(source, options) {
  const prettier = await getPrettier();
  const { ast } = await ensurePromise(
    prettier.__debug.parse(source, await loadPlugins(options), {
      massage: true,
    }),
  );
  return ast;
}

const indexProperties = [
  {
    property: "cursorOffset",
    placeholder: CURSOR_PLACEHOLDER,
  },
  {
    property: "rangeStart",
    placeholder: RANGE_START_PLACEHOLDER,
  },
  {
    property: "rangeEnd",
    placeholder: RANGE_END_PLACEHOLDER,
  },
];
function replacePlaceholders(originalText, originalOptions) {
  const indexes = indexProperties
    .map(({ property, placeholder }) => {
      const value = originalText.indexOf(placeholder);
      return value === -1 ? undefined : { property, value, placeholder };
    })
    .filter(Boolean)
    .sort((a, b) => a.value - b.value);

  const options = { ...originalOptions };
  let text = originalText;
  let offset = 0;
  for (const { property, value, placeholder } of indexes) {
    text = text.replace(placeholder, "");
    options[property] = value + offset;
    offset -= placeholder.length;
  }
  return { text, options };
}

const insertCursor = (text, cursorOffset) =>
  cursorOffset >= 0
    ? text.slice(0, cursorOffset) +
      CURSOR_PLACEHOLDER +
      text.slice(cursorOffset)
    : text;
async function format(originalText, originalOptions) {
  const { text: input, options } = replacePlaceholders(
    originalText,
    originalOptions,
  );
  const inputWithCursor = insertCursor(input, options.cursorOffset);
  const prettier = await getPrettier();

  const { formatted: output, cursorOffset } = await ensurePromise(
    prettier.formatWithCursor(input, await loadPlugins(options)),
  );
  const outputWithCursor = insertCursor(output, cursorOffset);
  const eolVisualizedOutput = visualizeEndOfLine(outputWithCursor);

  const changed = outputWithCursor !== inputWithCursor;

  return {
    changed,
    options,
    input,
    inputWithCursor,
    output,
    outputWithCursor,
    eolVisualizedOutput,
  };
}

async function getExternalPlugins() {
  const distDirectory = new URL("../../dist/", import.meta.url);
  const directories = fs.readdirSync(distDirectory);
  const plugins = await Promise.all(
    directories
      .filter((directory) => directory.startsWith("plugin-"))
      .map(async (directory) => {
        const url = new URL(`./${directory}/index.mjs`, distDirectory);
        const implementation = await import(url);
        return {
          url,
          implementation,
        };
      }),
  );
  const externalParsers = new Map();
  for (const plugin of plugins) {
    const { parsers } = plugin.implementation;
    if (parsers) {
      for (const parser of Object.keys(parsers)) {
        externalParsers.set(parser, plugin);
      }
    }
  }
  return externalParsers;
}

let externalParsers;
async function loadPlugins(options) {
  if (!isProduction || !options.parser || TEST_RUNTIME === "browser") {
    return options;
  }

  const { parser } = options;

  if (!externalParsers) {
    externalParsers = getExternalPlugins();
    externalParsers = await externalParsers;
  }
  if (!externalParsers.has(parser)) {
    return options;
  }
  const plugin = externalParsers.get(parser);

  const plugins = options.plugins ?? [];
  plugins.push(TEST_STANDALONE ? plugin.implementation : plugin.url);

  return { ...options, plugins };
}

export default runFormatTest;
