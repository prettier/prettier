"use strict";

const fs = require("fs");
const extname = require("path").extname;
const prettier = require("../");
const types = require("../src/ast-types");
const parser = require("../src/parser");

const RUN_AST_TESTS = process.env["AST_COMPARE"];
const VERIFY_ALL_PARSERS = process.env["VERIFY_ALL_PARSERS"] || false;
const ALL_PARSERS = process.env["ALL_PARSERS"]
  ? JSON.parse(process.env["ALL_PARSERS"])
  : ["flow", "babylon", "typescript"];

// Ignoring empty statements that are added into the output removes a
// lot of noise from test failures and let's us focus on the real
// failures when comparing asts
function removeEmptyStatements(ast) {
  return types.visit(ast, {
    visitEmptyStatement: function(path) {
      path.prune();
      return false;
    }
  });
}

function run_spec(dirname, options, additionalParsers) {
  fs.readdirSync(dirname).forEach(filename => {
    const extension = extname(filename);
    if (/^\.[jt]sx?$/.test(extension) && filename !== "jsfmt.spec.js") {
      const path = dirname + "/" + filename;
      const mergedOptions = mergeDefaultOptions(options || {});

      if (!RUN_AST_TESTS) {
        const source = read(path).replace(/\r\n/g, "\n");
        const output = prettyprint(source, path, mergedOptions);
        test(`${mergedOptions.parser} - ${parser.parser}-verify`, () => {
          expect(raw(source + "~".repeat(80) + "\n" + output)).toMatchSnapshot(
            filename
          );
        });

        getParsersToVerify(
          mergedOptions.parser,
          additionalParsers || []
        ).forEach(parserName => {
          test(`${filename} - ${parserName}-verify`, () => {
            const verifyOptions = Object.assign(mergedOptions, {
              parser: parserName
            });
            const verifyOutput = prettyprint(source, path, verifyOptions);
            expect(output).toEqual(verifyOutput);
          });
        });
      }

      if (RUN_AST_TESTS) {
        const source = read(dirname + "/" + filename);
        const ast = removeEmptyStatements(parse(source));
        let ppast;
        let pperr = null;
        try {
          ppast = removeEmptyStatements(parse(prettyprint(source, path, mergedOptions)));
        } catch (e) {
          pperr = e.stack;
        }

        test(path + " parse", () => {
          expect(pperr).toBe(null);
          expect(ppast).toBeDefined();
          if (ast.errors.length === 0) {
            expect(ast).toEqual(ppast);
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
    for (var key in ast) {
      if (
        key === "loc" || key === "range" || key === "raw" || key === "comments"
      ) {
        continue;
      }
      newObj[key] = stripLocation(ast[key]);
    }
    return newObj;
  }
  return ast;
}

function parse(string) {
  return stripLocation(parser.parseWithFlow(string));
}

function prettyprint(src, filename, options) {
  return prettier.format(
    src,
    Object.assign(
      {
        filename
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
      parser: "flow",
      printWidth: 80
    },
    parserConfig
  );
}

function getParsersToVerify(parser, additionalParsers) {
  if (VERIFY_ALL_PARSERS) {
    return ALL_PARSERS.splice(ALL_PARSERS.indexOf(parent), 1);
  }
  return additionalParsers;
}
