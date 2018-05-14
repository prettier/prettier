"use strict";

const fs = require("fs");
const extname = require("path").extname;
const prettier = require("./require_prettier");

const AST_COMPARE = process.env["AST_COMPARE"];

function run_spec(dirname, parsers, options) {
  /* instabul ignore if */
  if (!parsers || !parsers.length) {
    throw new Error(`No parsers were specified for ${dirname}`);
  }

  fs.readdirSync(dirname).forEach(filename => {
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
        ).toMatchSnapshot(filename);
      });

      parsers.slice(1).forEach(parser => {
        const verifyOptions = Object.assign({}, mergedOptions, { parser });
        test(`${filename} - ${parser}-verify`, () => {
          const verifyOutput = prettyprint(input, path, verifyOptions);
          expect(output).toEqual(verifyOutput);
        });
      });

      if (AST_COMPARE) {
        const compareOptions = Object.assign({}, mergedOptions);
        delete compareOptions.cursorOffset;
        const astMassaged = parse(input, compareOptions);
        let ppastMassaged;
        let pperr = null;
        try {
          ppastMassaged = parse(
            prettyprint(input, path, compareOptions),
            compareOptions
          );
        } catch (e) {
          pperr = e.stack;
        }

        test(path + " parse", () => {
          expect(pperr).toBe(null);
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

/**
 * Wraps a string in a marker object that is used by `./raw-serializer.js` to
 * directly print that string in a snapshot without escaping all double quotes.
 * Backticks will still be escaped.
 */
function raw(string) {
  if (typeof string !== "string") {
    throw new Error("Raw snapshots have to be strings.");
  }
  return { [Symbol.for("raw")]: string };
}

function mergeDefaultOptions(parserConfig) {
  return Object.assign(
    {
      printWidth: 80
    },
    parserConfig
  );
}
