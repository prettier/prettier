"use strict";

const fs = require("fs");
const path = require("path");
const raw = require("jest-snapshot-serializer-raw").wrap;
const { isCI } = require("ci-info");

const { TEST_STANDALONE } = process.env;
const AST_COMPARE = isCI || process.env.AST_COMPARE;
const DEEP_COMPARE = isCI || process.env.DEEP_COMPARE;
const TEST_CRLF =
  (isCI && process.platform === "win32") || process.env.TEST_CRLF;

const CURSOR_PLACEHOLDER = "<|>";
const RANGE_START_PLACEHOLDER = "<<<PRETTIER_RANGE_START>>>";
const RANGE_END_PLACEHOLDER = "<<<PRETTIER_RANGE_END>>>";

const prettier = !TEST_STANDALONE
  ? require("prettier/local")
  : require("prettier/standalone");

// TODO: these test files need fix
const unstableTests = new Map(
  [
    "class_comment/comments.js",
    ["comments/dangling_array.js", (options) => options.semi === false],
    ["comments/jsx.js", (options) => options.semi === false],
    "comments/return-statement.js",
    "comments/tagged-template-literal.js",
    "comments_closure_typecast/iife.js",
    "markdown_footnoteDefinition/multiline.md",
    "markdown_spec/example-234.md",
    "markdown_spec/example-235.md",
    "multiparser_html_js/script-tag-escaping.html",
    [
      "multiparser_js_markdown/codeblock.js",
      (options) => options.proseWrap === "always",
    ],
    ["no-semi/comments.js", (options) => options.semi === false],
    "yaml_prettier_ignore/document.yml",
  ].map((fixture) => {
    const [file, isUnstable = () => true] = Array.isArray(fixture)
      ? fixture
      : [fixture];
    return [path.join(__dirname, "../tests/", file), isUnstable];
  })
);

const isTestDirectory = (dirname, name) =>
  dirname.startsWith(path.join(__dirname, "../tests", name));

global.run_spec = (fixtures, parsers, options) => {
  fixtures = typeof fixtures === "string" ? { dirname: fixtures } : fixtures;
  const { dirname } = fixtures;

  // `IS_PARSER_INFERENCE_TESTS` mean to test `inferParser` on `standalone`
  const IS_PARSER_INFERENCE_TESTS = isTestDirectory(
    dirname,
    "parser-inference"
  );

  // `IS_ERROR_TESTS` mean to watch errors like:
  // - syntax parser hasn't supported yet
  // - syntax errors that should throws
  const IS_ERROR_TESTS = isTestDirectory(dirname, "errors");

  if (IS_PARSER_INFERENCE_TESTS) {
    parsers = [];
  } else if (!parsers || !parsers.length) {
    throw new Error(`No parsers were specified for ${dirname}`);
  }

  const snippets = (fixtures.snippets || []).map((test, index) => {
    test = typeof test === "string" ? { code: test } : test;
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
        basename === "jsfmt.spec.js"
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

  const stringifiedOptions = stringifyOptions(options);

  for (const { name, filename, code, output } of [...files, ...snippets]) {
    describe(`${name}${
      stringifiedOptions ? ` - ${stringifiedOptions}` : ""
    }`, () => {
      let rangeStart;
      let rangeEnd;
      let cursorOffset;

      const source = (TEST_CRLF ? code.replace(/\n/g, "\r\n") : code)
        .replace(RANGE_START_PLACEHOLDER, (match, offset) => {
          rangeStart = offset;
          return "";
        })
        .replace(RANGE_END_PLACEHOLDER, (match, offset) => {
          rangeEnd = offset;
          return "";
        });

      const input = source.replace(CURSOR_PLACEHOLDER, (match, offset) => {
        cursorOffset = offset;
        return "";
      });

      const baseOptions = {
        printWidth: 80,
        ...options,
        rangeStart,
        rangeEnd,
        cursorOffset,
      };
      const mainOptions = {
        ...baseOptions,
        ...(IS_PARSER_INFERENCE_TESTS
          ? { filepath: filename }
          : { parser: parsers[0] }),
      };

      const hasEndOfLine = "endOfLine" in mainOptions;

      if (IS_ERROR_TESTS) {
        test("error test", () => {
          expect(() => {
            format(input, filename, mainOptions);
          }).toThrowErrorMatchingSnapshot();
        });
        return;
      }

      const formattedWithCursor = format(input, filename, mainOptions);
      const formatted = formattedWithCursor.replace(CURSOR_PLACEHOLDER, "");
      const visualizedOutput = visualizeEndOfLine(formattedWithCursor);

      test("format", () => {
        expect(visualizedOutput).toEqual(
          visualizeEndOfLine(consistentEndOfLine(formattedWithCursor))
        );
        if (typeof output === "string") {
          expect(formatted).toEqual(output);
        } else {
          expect(
            raw(
              createSnapshot(
                hasEndOfLine
                  ? visualizeEndOfLine(
                      code
                        .replace(RANGE_START_PLACEHOLDER, "")
                        .replace(RANGE_END_PLACEHOLDER, "")
                    )
                  : source,
                hasEndOfLine ? visualizedOutput : formattedWithCursor,
                { ...baseOptions, parsers }
              )
            )
          ).toMatchSnapshot();
        }
      });

      const parsersToVerify = parsers.slice(1);
      if (parsers.includes("typescript") && !parsers.includes("babel-ts")) {
        parsersToVerify.push("babel-ts");
      }

      for (const parser of parsersToVerify) {
        const verifyOptions = { ...baseOptions, parser };

        test(`verify (${parser})`, () => {
          if (
            parser === "babel-ts" &&
            options &&
            (options.disableBabelTS === true ||
              (Array.isArray(options.disableBabelTS) &&
                options.disableBabelTS.includes(name)))
          ) {
            expect(() => {
              format(input, filename, verifyOptions);
            }).toThrow(TEST_STANDALONE ? undefined : SyntaxError);
          } else {
            const verifyOutput = format(input, filename, verifyOptions);
            expect(visualizeEndOfLine(verifyOutput)).toEqual(visualizedOutput);
          }
        });
      }

      const isUnstable = unstableTests.get(filename);
      const isUnstableTest = isUnstable && isUnstable(options || {});
      if (
        DEEP_COMPARE &&
        (formatted !== input || isUnstableTest) &&
        typeof rangeStart === "undefined" &&
        typeof rangeEnd === "undefined" &&
        typeof cursorOffset === "undefined" &&
        !TEST_CRLF
      ) {
        test("second format", () => {
          const secondOutput = format(formatted, filename, mainOptions);
          if (isUnstableTest) {
            // To keep eye on failed tests, this assert never supposed to pass,
            // if it fails, just remove the file from `unstableTests`
            expect(secondOutput).not.toEqual(formatted);
          } else {
            expect(secondOutput).toEqual(formatted);
          }
        });
      }

      if (AST_COMPARE && formatted !== input) {
        test("compare AST", () => {
          const { cursorOffset, ...parseOptions } = mainOptions;
          const originalAst = parse(input, parseOptions);
          const formattedAst = parse(formatted, parseOptions);
          expect(originalAst).toEqual(formattedAst);
        });
      }
    });
  }
};

function parse(source, options) {
  return prettier.__debug.parse(source, options, /* massage */ true).ast;
}

function format(source, filename, options) {
  const result = prettier.formatWithCursor(source, {
    filepath: filename,
    ...options,
  });

  return options.cursorOffset >= 0
    ? result.formatted.slice(0, result.cursorOffset) +
        CURSOR_PLACEHOLDER +
        result.formatted.slice(result.cursorOffset)
    : result.formatted;
}

function consistentEndOfLine(text) {
  let firstEndOfLine;
  return text.replace(/\r\n?|\n/g, (endOfLine) => {
    if (!firstEndOfLine) {
      firstEndOfLine = endOfLine;
    }
    return firstEndOfLine;
  });
}

function visualizeEndOfLine(text) {
  return text.replace(/\r\n?|\n/g, (endOfLine) => {
    switch (endOfLine) {
      case "\n":
        return "<LF>\n";
      case "\r\n":
        return "<CRLF>\n";
      case "\r":
        return "<CR>\n";
      default:
        throw new Error(`Unexpected end of line ${JSON.stringify(endOfLine)}`);
    }
  });
}

function createSnapshot(input, output, options) {
  const separatorWidth = 80;
  const printWidthIndicator =
    options.printWidth > 0 && Number.isFinite(options.printWidth)
      ? " ".repeat(options.printWidth) + "| printWidth"
      : [];
  return []
    .concat(
      printSeparator(separatorWidth, "options"),
      printOptions(
        omit(
          options,
          (k) =>
            k === "rangeStart" ||
            k === "rangeEnd" ||
            k === "cursorOffset" ||
            k === "disableBabelTS"
        )
      ),
      printWidthIndicator,
      printSeparator(separatorWidth, "input"),
      input,
      printSeparator(separatorWidth, "output"),
      output,
      printSeparator(separatorWidth)
    )
    .join("\n");
}

function printSeparator(width, description) {
  description = description || "";
  const leftLength = Math.floor((width - description.length) / 2);
  const rightLength = width - leftLength - description.length;
  return "=".repeat(leftLength) + description + "=".repeat(rightLength);
}

function printOptions(options) {
  const keys = Object.keys(options).sort();
  return keys.map((key) => `${key}: ${stringify(options[key])}`).join("\n");
  function stringify(value) {
    return value === Infinity
      ? "Infinity"
      : Array.isArray(value)
      ? `[${value.map((v) => JSON.stringify(v)).join(", ")}]`
      : JSON.stringify(value);
  }
}

function omit(obj, fn) {
  return Object.keys(obj).reduce((reduced, key) => {
    const value = obj[key];
    if (!fn(key, value)) {
      reduced[key] = value;
    }
    return reduced;
  }, {});
}

function stringifyOptions(options) {
  const string = JSON.stringify(options || {}, (key, value) =>
    key === "disableBabelTS"
      ? undefined
      : value === Infinity
      ? "Infinity"
      : value
  );

  return string === "{}" ? "" : string;
}
