"use strict";

const fs = require("fs");
const extname = require("path").extname;
const raw = require("jest-snapshot-serializer-raw").wrap;

const AST_COMPARE = process.env["AST_COMPARE"];
const TEST_STANDALONE = process.env["TEST_STANDALONE"];

const prettier = !TEST_STANDALONE
  ? require("prettier/local")
  : require("prettier/standalone");

function run_spec(dirname, parsers, options) {
  /* instabul ignore if */
  if (!parsers || !parsers.length) {
    throw new Error(`No parsers were specified for ${dirname}`);
  }

  fs.readdirSync(dirname).forEach(filename => {
    // We need to have a skipped test with the same name of the snapshots,
    // so Jest doesn't mark them as obsolete.
    if (TEST_STANDALONE && parsers.some(skipStandalone)) {
      parsers.forEach(parser =>
        test.skip(`${filename} - ${parser}-verify`, () => {})
      );
      return;
    }

    const path = dirname + "/" + filename;
    if (
      extname(filename) !== ".snap" &&
      fs.lstatSync(path).isFile() &&
      filename[0] !== "." &&
      filename !== "jsfmt.spec.js"
    ) {
      let rangeStart = 0;
      let rangeEnd = Infinity;
      let cursorOffset;
      const source = read(path)
        .replace(/\r\n/g, "\n")
        .replace("<<<PRETTIER_RANGE_START>>>", (match, offset) => {
          rangeStart = offset;
          return "";
        })
        .replace("<<<PRETTIER_RANGE_END>>>", (match, offset) => {
          rangeEnd = offset;
          return "";
        });

      const input = source.replace("<|>", (match, offset) => {
        cursorOffset = offset;
        return "";
      });

      const mergedOptions = Object.assign(mergeDefaultOptions(options || {}), {
        parser: parsers[0],
        rangeStart,
        rangeEnd,
        cursorOffset
      });
      const output = prettyprint(input, path, mergedOptions);
      test(`${filename} - ${mergedOptions.parser}-verify`, () => {
        expect(
          raw(source + "~".repeat(mergedOptions.printWidth) + "\n" + output)
        ).toMatchSnapshot();
      });

      parsers.slice(1).forEach(parser => {
        const verifyOptions = Object.assign({}, mergedOptions, { parser });
        test(`${filename} - ${parser}-verify`, () => {
          const verifyOutput = prettyprint(input, path, verifyOptions);
          expect(output).toEqual(verifyOutput);
        });
      });

      if (AST_COMPARE) {
        test(`${path} parse`, () => {
          const compareOptions = Object.assign({}, mergedOptions);
          delete compareOptions.cursorOffset;
          const astMassaged = parse(input, compareOptions);
          let ppastMassaged = undefined;

          expect(() => {
            ppastMassaged = parse(
              prettyprint(input, path, compareOptions),
              compareOptions
            );
          }).not.toThrow();

          expect(ppastMassaged).toBeDefined();
          if (!astMassaged.errors || astMassaged.errors.length === 0) {
            expect(astMassaged).toEqual(ppastMassaged);
          }
        });
      }
    }
  });
}

global.run_spec = run_spec;

function parse(string, opts) {
  return prettier.__debug.parse(string, opts, /* massage */ true).ast;
}

function prettyprint(src, filename, options) {
  const result = prettier.formatWithCursor(
    src,
    Object.assign(
      {
        filepath: filename
      },
      options
    )
  );
  if (options.cursorOffset >= 0) {
    result.formatted =
      result.formatted.slice(0, result.cursorOffset) +
      "<|>" +
      result.formatted.slice(result.cursorOffset);
  }
  return result.formatted;
}

function read(filename) {
  return fs.readFileSync(filename, "utf8");
}

function skipStandalone(/* parser */) {
  return false;
}

function mergeDefaultOptions(parserConfig) {
  return Object.assign(
    {
      printWidth: 80
    },
    parserConfig
  );
}
