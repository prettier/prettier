"use strict";

const fs = require("fs");
const path = require("path");
const raw = require("jest-snapshot-serializer-raw").wrap;

const AST_COMPARE = process.env["AST_COMPARE"];
const TEST_STANDALONE = process.env["TEST_STANDALONE"];
const TEST_CRLF = process.env["TEST_CRLF"];

const CURSOR_PLACEHOLDER = "<|>";

const prettier = !TEST_STANDALONE
  ? require("prettier/local")
  : require("prettier/standalone");

global.run_spec = (dirname, parsers, options) => {
  // istanbul ignore next
  if (!parsers || !parsers.length) {
    throw new Error(`No parsers were specified for ${dirname}`);
  }

  fs.readdirSync(dirname).forEach(basename => {
    const filename = path.join(dirname, basename);

    if (
      path.extname(basename) === ".snap" ||
      !fs.lstatSync(filename).isFile() ||
      basename[0] === "." ||
      basename === "jsfmt.spec.js"
    ) {
      return;
    }

    let rangeStart;
    let rangeEnd;
    let cursorOffset;

    const text = fs.readFileSync(filename, "utf8");

    const source = (TEST_CRLF ? text.replace(/\n/g, "\r\n") : text)
      .replace("<<<PRETTIER_RANGE_START>>>", (match, offset) => {
        rangeStart = offset;
        return "";
      })
      .replace("<<<PRETTIER_RANGE_END>>>", (match, offset) => {
        rangeEnd = offset;
        return "";
      });

    const input = source.replace(CURSOR_PLACEHOLDER, (match, offset) => {
      cursorOffset = offset;
      return "";
    });

    const formatOptions = Object.assign({ printWidth: 80 }, options, {
      parser: parsers[0],
      rangeStart,
      rangeEnd,
      cursorOffset
    });

    const hasEndOfLine = "endOfLine" in formatOptions;

    const output = format(input, filename, formatOptions);
    const visualizedOutput = visualizeEndOfLine(output);

    test(`${basename} - ${formatOptions.parser}-verify`, () => {
      expect(visualizedOutput).toEqual(
        visualizeEndOfLine(consistentEndOfLine(output))
      );
      expect(
        raw(
          (hasEndOfLine ? visualizeEndOfLine(source) : source) +
            "~".repeat(formatOptions.printWidth) +
            "\n" +
            (hasEndOfLine ? visualizedOutput : output)
        )
      ).toMatchSnapshot();
    });

    for (const parser of parsers.slice(1)) {
      const verifyOptions = Object.assign({}, formatOptions, { parser });
      test(`${basename} - ${parser}-verify`, () => {
        const verifyOutput = format(input, filename, verifyOptions);
        expect(visualizedOutput).toEqual(visualizeEndOfLine(verifyOutput));
      });
    }

    if (AST_COMPARE) {
      test(`${filename} parse`, () => {
        const parseOptions = Object.assign({}, formatOptions);
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
  });
};

function parse(source, options) {
  return prettier.__debug.parse(source, options, /* massage */ true).ast;
}

function format(source, filename, options) {
  const result = prettier.formatWithCursor(
    source,
    Object.assign({ filepath: filename }, options)
  );

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
