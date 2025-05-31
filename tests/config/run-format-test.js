import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import createEsmUtils from "esm-utils";
import getPrettier from "./get-prettier.js";
import checkParsers from "./utils/check-parsers.js";
import consistentEndOfLine from "./utils/consistent-end-of-line.js";
import createSnapshot from "./utils/create-snapshot.js";
import stringifyOptionsForTitle from "./utils/stringify-options-for-title.js";
import visualizeEndOfLine from "./utils/visualize-end-of-line.js";

const { __dirname } = createEsmUtils(import.meta);

const { FULL_TEST, TEST_STANDALONE, NODE_ENV } = process.env;
const isProduction = NODE_ENV === "production";
const BOM = "\uFEFF";

const CURSOR_PLACEHOLDER = "<|>";
const RANGE_START_PLACEHOLDER = "<<<PRETTIER_RANGE_START>>>";
const RANGE_END_PLACEHOLDER = "<<<PRETTIER_RANGE_END>>>";

// TODO: these test files need fix
const unstableTests = new Map(
  [
    "js/class-comment/misc.js",
    ["js/comments/dangling_array.js", (options) => options.semi === false],
    ["js/comments/jsx.js", (options) => options.semi === false],
    "js/comments/return-statement.js",
    "js/comments/tagged-template-literal.js",
    "markdown/spec/example-234.md",
    "markdown/spec/example-235.md",
    [
      "js/multiparser-markdown/codeblock.js",
      (options) => options.proseWrap === "always",
    ],
    ["js/no-semi/comments.js", (options) => options.semi === false],
    ["flow/no-semi/comments.js", (options) => options.semi === false],
    "flow/hook/declare-hook.js",
    "flow/hook/hook-type-annotation.js",
    "typescript/prettier-ignore/mapped-types.ts",
    "typescript/prettier-ignore/issue-14238.ts",
    "js/comments/html-like/comment.js",
    "js/for/continue-and-break-comment-without-blocks.js",
    "js/sequence-expression/parenthesized.js",
    "typescript/satisfies-operators/comments-unstable.ts",
    ["js/identifier/parentheses/let.js", (options) => options.semi === false],
    "jsx/comments/in-attributes.js",
    ["js/ignore/semi/asi.js", (options) => options.semi === false],
    "typescript/union/consistent-with-flow/single-type.ts",
    "js/if/non-block.js",
  ].map((fixture) => {
    const [file, isUnstable = () => true] = Array.isArray(fixture)
      ? fixture
      : [fixture];
    return [path.join(__dirname, "../format/", file), isUnstable];
  }),
);

const unstableAstTests = new Map();
const commentClosureTypecaseTests = new Set(
  [
    // These tests only work for `babel`, `acorn`, and `oxc`
    "comments-closure-typecast",
  ].map((directory) => path.join(__dirname, "../format/js", directory)),
);

const espreeDisabledTests = commentClosureTypecaseTests;
const acornDisabledTests = new Set();
const meriyahDisabledTests = new Set([
  ...commentClosureTypecaseTests,
  ...[
    // Parsing to different ASTs
    "js/decorators/member-expression.js",
    // Meriyah parse RegExp relay on runtime behavior
    // The following fails on Node.js < 20
    "js/babel-plugins/regex-v-flag.js",
    "js/regex/v-flag.js",
    "js/regex/d-flag.js",
    "js/babel-plugins/regexp-modifiers.js",
    "js/regex/regexp-modifiers.js",
  ].map((file) => path.join(__dirname, "../format", file)),
]);
const babelTsDisabledTests = new Set(
  ["conformance/types/moduleDeclaration/kind-detection.ts"].map((file) =>
    path.join(__dirname, "../format/typescript", file),
  ),
);
const oxcDisabledTests = new Set(
  [
    // Missing `.decorators`
    // https://github.com/oxc-project/oxc/issues/10921
    "js/babel-plugins/decorators.js",
    "js/decorators",
    "js/decorators/class-expression",
    "js/decorators-export",
    "js/decorator-auto-accessors",
    "js/ignore/class-expression-decorator.js",
  ].map((file) => path.join(__dirname, "../format", file)),
);
const oxcTsDisabledTests = new Set(
  [
    // https://github.com/oxc-project/oxc/issues/11029
    "typescript/decorators/abstract-method.ts",
  ].map((file) => path.join(__dirname, "../format", file)),
);
const hermesDisabledTests = new Set([
  ...commentClosureTypecaseTests,
  ...[
    // Need update L183 to use `replaceAll`
    // https://app.unpkg.com/hermes-parser@0.28.1/files/dist/HermesASTAdapter.js
    "js/call/first-argument-expansion/expression-2nd-arg.js",
    "js/directives/escaped.js",
    // Not supported
    "flow/comments",
    "flow-repo/union_new",
    // Wrongly parsed
    "js/sloppy-mode/function-declaration-in-if.js",
    // Wrong location of `Property.value`
    "js/classes/method.js",
    "js/comments/function-declaration.js",
  ].map((file) => path.join(__dirname, "../format", file)),
]);

const isUnstable = (filename, options) => {
  const testFunction = unstableTests.get(filename);

  if (!testFunction) {
    return false;
  }

  return testFunction(options);
};

const isAstUnstable = (filename, options) => {
  const testFunction = unstableAstTests.get(filename);

  if (!testFunction) {
    return false;
  }

  return testFunction(options);
};

const shouldThrowOnFormat = (filename, options) => {
  const { errors = {} } = options;
  if (errors === true) {
    return true;
  }

  const files = errors[options.parser];

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

function runFormatTest(fixtures, parsers, options) {
  let { importMeta, snippets = [] } = fixtures.importMeta
    ? fixtures
    : { importMeta: fixtures };

  const filename = path.basename(new URL(importMeta.url).pathname);
  if (filename !== "format.test.js") {
    throw new Error(`Format test should run in file named 'format.test.js'.`);
  }

  const dirname = path.dirname(url.fileURLToPath(importMeta.url));

  // `IS_PARSER_INFERENCE_TESTS` mean to test `inferParser` on `standalone`
  const IS_PARSER_INFERENCE_TESTS = isTestDirectory(
    dirname,
    "misc/parser-inference",
  );

  // `IS_ERROR_TESTS` mean to watch errors like:
  // - syntax parser hasn't supported yet
  // - syntax errors that should throws
  const IS_ERROR_TESTS = isTestDirectory(dirname, "misc/errors");
  if (IS_ERROR_TESTS) {
    options = { errors: true, ...options };
  }

  const IS_TYPESCRIPT_ONLY_TEST = isTestDirectory(
    dirname,
    "misc/typescript-only",
  );

  if (IS_PARSER_INFERENCE_TESTS) {
    parsers = [undefined];
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

  const [parser] = parsers;
  const allParsers = [...parsers];

  if (!IS_ERROR_TESTS) {
    if (
      parsers.includes("babel") &&
      (isTestDirectory(dirname, "js") || isTestDirectory(dirname, "jsx"))
    ) {
      if (!parsers.includes("acorn") && !acornDisabledTests.has(dirname)) {
        allParsers.push("acorn");
      }
      if (!parsers.includes("espree") && !espreeDisabledTests.has(dirname)) {
        allParsers.push("espree");
      }
      if (!parsers.includes("meriyah") && !meriyahDisabledTests.has(dirname)) {
        allParsers.push("meriyah");
      }
      if (!parsers.includes("acorn") && !oxcDisabledTests.has(dirname)) {
        allParsers.push("oxc");
      }
    }

    if (parsers.includes("typescript") && !IS_TYPESCRIPT_ONLY_TEST) {
      if (!parsers.includes("babel-ts")) {
        allParsers.push("babel-ts");
      }
      if (!parsers.includes("oxc-ts")) {
        allParsers.push("oxc-ts");
      }
    }

    if (parsers.includes("flow") && !parsers.includes("babel-flow")) {
      allParsers.push("babel-flow");
    }

    if (
      parsers.includes("flow") &&
      !parsers.includes("hermes") &&
      !hermesDisabledTests.has(dirname)
    ) {
      allParsers.push("hermes");
    }

    if (parsers.includes("babel") && !parsers.includes("__babel_estree")) {
      allParsers.push("__babel_estree");
    }
  }

  const stringifiedOptions = stringifyOptionsForTitle(options);

  for (const { name, filename, code, output } of [...files, ...snippets]) {
    const title = `${name}${
      stringifiedOptions ? ` - ${stringifiedOptions}` : ""
    }`;

    describe(title, () => {
      const formatOptions = {
        printWidth: 80,
        ...options,
        filepath: filename,
        parser,
      };
      const shouldThrowOnMainParserFormat = shouldThrowOnFormat(
        name,
        formatOptions,
      );

      let mainParserFormatResult;
      if (shouldThrowOnMainParserFormat) {
        mainParserFormatResult = { options: formatOptions, error: true };
      } else {
        beforeAll(async () => {
          mainParserFormatResult = await format(code, formatOptions);
        });
      }

      for (const currentParser of allParsers) {
        if (
          (currentParser === "acorn" && acornDisabledTests.has(filename)) ||
          (currentParser === "espree" && espreeDisabledTests.has(filename)) ||
          (currentParser === "meriyah" && meriyahDisabledTests.has(filename)) ||
          (currentParser === "oxc" && oxcDisabledTests.has(filename)) ||
          (currentParser === "oxc-ts" && oxcTsDisabledTests.has(filename)) ||
          (currentParser === "hermes" && hermesDisabledTests.has(filename)) ||
          (currentParser === "babel-ts" && babelTsDisabledTests.has(filename))
        ) {
          continue;
        }

        const testTitle =
          shouldThrowOnMainParserFormat ||
          formatOptions.parser !== currentParser
            ? `[${currentParser}] format`
            : "format";

        test(testTitle, async () => {
          await runTest({
            parsers,
            name,
            filename,
            code,
            output,
            parser: currentParser,
            mainParserFormatResult,
            mainParserFormatOptions: formatOptions,
          });
        });
      }
    });
  }
}

async function runTest({
  parsers,
  name,
  filename,
  code,
  output,
  parser,
  mainParserFormatResult,
  mainParserFormatOptions,
}) {
  let formatOptions = mainParserFormatOptions;
  let formatResult = mainParserFormatResult;

  // Verify parsers or error tests
  if (
    mainParserFormatResult.error ||
    mainParserFormatOptions.parser !== parser
  ) {
    formatOptions = { ...mainParserFormatResult.options, parser };
    const runFormat = () => format(code, formatOptions);

    if (shouldThrowOnFormat(name, formatOptions)) {
      await expect(runFormat()).rejects.toThrowErrorMatchingSnapshot();
      return;
    }

    // Verify parsers format result should be the same as main parser
    output = mainParserFormatResult.outputWithCursor;
    formatResult = await runFormat();
  }

  // Make sure output has consistent EOL
  expect(formatResult.eolVisualizedOutput).toEqual(
    visualizeEndOfLine(consistentEndOfLine(formatResult.outputWithCursor)),
  );

  // The result is assert to equals to `output`
  if (typeof output === "string") {
    expect(formatResult.eolVisualizedOutput).toEqual(
      visualizeEndOfLine(output),
    );
    return;
  }

  // All parsers have the same result, only snapshot the result from main parser
  expect(
    createSnapshot(formatResult, {
      parsers,
      formatOptions,
      CURSOR_PLACEHOLDER,
    }),
  ).toMatchSnapshot();

  if (!FULL_TEST) {
    return;
  }

  const isUnstableTest = isUnstable(filename, formatOptions);
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
      expect(secondOutput).not.toEqual(firstOutput);
    } else {
      expect(secondOutput).toEqual(firstOutput);
    }
  }

  const isAstUnstableTest = isAstUnstable(filename, formatOptions);
  // Some parsers skip parsing empty files
  if (formatResult.changed && code.trim()) {
    const { input, output } = formatResult;
    const originalAst = await parse(input, formatOptions);
    const formattedAst = await parse(output, formatOptions);
    if (isAstUnstableTest) {
      expect(formattedAst).not.toEqual(originalAst);
    } else {
      expect(formattedAst).toEqual(originalAst);
    }
  }

  if (!shouldSkipEolTest(code, formatResult.options)) {
    for (const eol of ["\r\n", "\r"]) {
      const { eolVisualizedOutput: output } = await format(
        code.replace(/\n/gu, eol),
        formatOptions,
      );
      // Only if `endOfLine: "auto"` the result will be different
      const expected =
        formatOptions.endOfLine === "auto"
          ? visualizeEndOfLine(
              // All `code` use `LF`, so the `eol` of result is always `LF`
              formatResult.outputWithCursor.replace(/\n/gu, eol),
            )
          : formatResult.eolVisualizedOutput;
      expect(output).toEqual(expected);
    }
  }

  if (code.charAt(0) !== BOM) {
    const { eolVisualizedOutput: output } = await format(
      BOM + code,
      formatOptions,
    );
    const expected = BOM + formatResult.eolVisualizedOutput;
    expect(output).toEqual(expected);
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

const externalPlugins = new Map([
  ["oxc", "plugin-oxc"],
  ["oxc-ts", "plugin-oxc"],
  ["hermes", "plugin-hermes"],
]);
async function loadPlugins(options) {
  const { parser } = options;
  if (externalPlugins.has(options.parser)) {
    const plugins = options.plugins ?? [];
    const pluginName = externalPlugins.get(parser);
    const url = new URL(
      isProduction
        ? `../../dist/${pluginName}/index.mjs`
        : `../../packages/${pluginName}/index.js`,
      import.meta.url,
    );
    plugins.push(TEST_STANDALONE ? await import(url) : url);
    return { ...options, plugins };
  }

  return options;
}

export default runFormatTest;
