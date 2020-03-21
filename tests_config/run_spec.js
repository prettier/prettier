"use strict";

const fs = require("fs");
const path = require("path");
const raw = require("jest-snapshot-serializer-raw").wrap;
const { isCI } = require("ci-info");

const { TEST_STANDALONE, TEST_CRLF } = process.env;
const AST_COMPARE = isCI || process.env.AST_COMPARE;
const DEEP_COMPARE = isCI || process.env.DEEP_COMPARE;

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
    ["comments/dangling_array.js", options => options.semi === false],
    ["comments/jsx.js", options => options.semi === false],
    "comments/return-statement.js",
    "comments/tagged-template-literal.js",
    "comments_closure_typecast/iife.js",
    "css_atrule/include.css",
    "graphql_interface/separator-detection.graphql",
    [
      "html_angular/attributes.component.html",
      options => options.printWidth === 1
    ],
    "html_prettier_ignore/cases.html",
    "js_empty/semicolon.js",
    "jsx_ignore/jsx_ignore.js",
    "markdown_footnoteDefinition/multiline.md",
    "markdown_spec/example-234.md",
    "markdown_spec/example-235.md",
    "multiparser_html_js/script-tag-escaping.html",
    [
      "multiparser_js_markdown/codeblock.js",
      options => options.proseWrap === "always"
    ],
    ["no-semi/comments.js", options => options.semi === false],
    "yaml_prettier_ignore/document.yml"
  ].map(fixture => {
    const [file, isUnstable = () => true] = Array.isArray(fixture)
      ? fixture
      : [fixture];
    return [path.join(__dirname, "../tests/", file), isUnstable];
  })
);

global.run_spec = (dirname, parsers, options) => {
  // `IS_PARSER_INFERENCE_TESTS` mean to test `inferParser` on `standalone`
  const IS_PARSER_INFERENCE_TESTS = dirname.endsWith("parser-inference");
  if (IS_PARSER_INFERENCE_TESTS) {
    parsers = [];
  } else if (!parsers || !parsers.length) {
    throw new Error(`No parsers were specified for ${dirname}`);
  }

  const files = fs.readdirSync(dirname, { withFileTypes: true });
  for (const file of files) {
    const basename = file.name;
    const filename = path.join(dirname, basename);

    if (
      path.extname(basename) === ".snap" ||
      !file.isFile() ||
      basename[0] === "." ||
      basename === "jsfmt.spec.js"
    ) {
      continue;
    }

    let rangeStart;
    let rangeEnd;
    let cursorOffset;

    const text = fs.readFileSync(filename, "utf8");

    const source = (TEST_CRLF ? text.replace(/\n/g, "\r\n") : text)
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
      cursorOffset
    };
    const mainOptions = {
      ...baseOptions,
      ...(IS_PARSER_INFERENCE_TESTS
        ? { filepath: filename }
        : { parser: parsers[0] })
    };

    const hasEndOfLine = "endOfLine" in mainOptions;

    const output = format(input, filename, mainOptions);
    const visualizedOutput = visualizeEndOfLine(output);

    test(basename, () => {
      expect(visualizedOutput).toEqual(
        visualizeEndOfLine(consistentEndOfLine(output))
      );
      expect(
        raw(
          createSnapshot(
            hasEndOfLine
              ? visualizeEndOfLine(
                  text
                    .replace(RANGE_START_PLACEHOLDER, "")
                    .replace(RANGE_END_PLACEHOLDER, "")
                )
              : source,
            hasEndOfLine ? visualizedOutput : output,
            { ...baseOptions, parsers }
          )
        )
      ).toMatchSnapshot();
    });

    const parsersToVerify = parsers.slice(1);
    if (parsers.includes("typescript") && !parsers.includes("babel-ts")) {
      parsersToVerify.push("babel-ts");
    }

    if (
      DEEP_COMPARE &&
      typeof rangeStart === "undefined" &&
      typeof rangeEnd === "undefined" &&
      typeof cursorOffset === "undefined" &&
      !TEST_CRLF
    ) {
      test(`${basename} second format`, () => {
        const secondOutput = format(output, filename, mainOptions);
        const isUnstable = unstableTests.get(filename);
        if (isUnstable && isUnstable(options || {})) {
          // To keep eye on failed tests, this assert never supposed to pass,
          // if it fails, just remove the file from `unstableTests`
          expect(secondOutput).not.toEqual(output);
        } else {
          expect(secondOutput).toEqual(output);
        }
      });
    }

    for (const parser of parsersToVerify) {
      const verifyOptions = { ...baseOptions, parser };

      test(`${basename} - ${parser}-verify`, () => {
        if (
          parser === "babel-ts" &&
          options &&
          (options.disableBabelTS === true ||
            (Array.isArray(options.disableBabelTS) &&
              options.disableBabelTS.includes(basename)))
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

    if (AST_COMPARE) {
      test(`${basename} parse`, () => {
        const parseOptions = { ...mainOptions };
        delete parseOptions.cursorOffset;

        const originalAst = parse(input, parseOptions);
        let formattedAst;

        expect(() => {
          formattedAst = parse(
            output.replace(CURSOR_PLACEHOLDER, ""),
            parseOptions
          );
        }).not.toThrow();
        expect(originalAst).toEqual(formattedAst);
      });
    }
  }
};

function parse(source, options) {
  return prettier.__debug.parse(source, options, /* massage */ true).ast;
}

function format(source, filename, options) {
  const result = prettier.formatWithCursor(source, {
    filepath: filename,
    ...options
  });

  return options.cursorOffset >= 0
    ? result.formatted.slice(0, result.cursorOffset) +
        CURSOR_PLACEHOLDER +
        result.formatted.slice(result.cursorOffset)
    : result.formatted;
}

function consistentEndOfLine(text) {
  let firstEndOfLine;
  return text.replace(/\r\n?|\n/g, endOfLine => {
    if (!firstEndOfLine) {
      firstEndOfLine = endOfLine;
    }
    return firstEndOfLine;
  });
}

function visualizeEndOfLine(text) {
  return text.replace(/\r\n?|\n/g, endOfLine => {
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
          k =>
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
  return keys.map(key => `${key}: ${stringify(options[key])}`).join("\n");
  function stringify(value) {
    return value === Infinity
      ? "Infinity"
      : Array.isArray(value)
      ? `[${value.map(v => JSON.stringify(v)).join(", ")}]`
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
