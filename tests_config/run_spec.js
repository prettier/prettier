"use strict";

const fs = require("fs");
const extname = require("path").extname;
const prettier = require("./require_prettier");
const massageAST = require("../src/common/clean-ast.js").massageAST;
const normalizeOptions = require("../src/main/options").normalize;

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

      const mergedOptions = Object.assign(mergeDefaultOptions(options || {}), {
        parser: parsers[0],
        rangeStart: rangeStart,
        rangeEnd: rangeEnd
      });
      const output = prettyprint(source, path, mergedOptions);
      test(`${filename} - ${mergedOptions.parser}-verify`, () => {
        expect(
          raw(source + "~".repeat(mergedOptions.printWidth) + "\n" + output)
        ).toMatchSnapshot(filename);
      });

      parsers.slice(1).forEach(parserName => {
        test(`${filename} - ${parserName}-verify`, () => {
          const verifyOptions = Object.assign(mergedOptions, {
            parser: parserName
          });
          const verifyOutput = prettyprint(source, path, verifyOptions);
          expect(output).toEqual(verifyOutput);
        });
      });

      if (AST_COMPARE) {
        const normalizedOptions = normalizeOptions(mergedOptions);
        const ast = parse(source, mergedOptions);
        const astMassaged = massageAST(ast, normalizedOptions);
        let ppastMassaged;
        let pperr = null;
        try {
          const ppast = parse(
            prettyprint(source, path, mergedOptions),
            mergedOptions
          );
          ppastMassaged = massageAST(ppast, normalizedOptions);
        } catch (e) {
          pperr = e.stack;
        }

        test(path + " parse", () => {
          expect(pperr).toBe(null);
          expect(ppastMassaged).toBeDefined();
          if (!ast.errors || ast.errors.length === 0) {
            expect(astMassaged).toEqual(ppastMassaged);
          }
        });
      }
    }
  });
}

global.run_spec = run_spec;

function stripLocation(ast) {
  if (Array.isArray(ast)) {
    return ast.map(e => stripLocation(e));
  }
  if (typeof ast === "object") {
    const newObj = {};
    for (const key in ast) {
      if (
        key === "loc" ||
        key === "range" ||
        key === "raw" ||
        key === "comments" ||
        key === "parent" ||
        key === "prev"
      ) {
        continue;
      }
      newObj[key] = stripLocation(ast[key]);
    }
    return newObj;
  }
  return ast;
}

function parse(string, opts) {
  return stripLocation(prettier.__debug.parse(string, opts));
}

function prettyprint(src, filename, options) {
  return prettier.format(
    src,
    Object.assign(
      {
        filepath: filename
      },
      options
    )
  );
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
