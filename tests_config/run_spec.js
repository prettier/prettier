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
      let rangeStart;
      let rangeEnd;
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

      const baseOptions = Object.assign(mergeDefaultOptions(options || {}), {
        rangeStart,
        rangeEnd,
        cursorOffset
      });
      const mainOptions = Object.assign({}, baseOptions, {
        parser: parsers[0]
      });
      const output = prettyprint(input, path, mainOptions);
      test(filename, () => {
        expect(
          raw(
            createSnapshot(
              source,
              output,
              Object.assign({}, baseOptions, { parsers })
            )
          )
        ).toMatchSnapshot();
      });

      parsers.slice(1).forEach(parser => {
        const verifyOptions = Object.assign({}, mainOptions, { parser });
        test(`${filename} - ${parser}-verify`, () => {
          const verifyOutput = prettyprint(input, path, verifyOptions);
          expect(output).toEqual(verifyOutput);
        });
      });

      if (AST_COMPARE) {
        test(`${path} parse`, () => {
          const compareOptions = Object.assign({}, mainOptions);
          delete compareOptions.cursorOffset;
          const astMassaged = parse(input, compareOptions);
          let ppastMassaged = undefined;

          expect(() => {
            ppastMassaged = parse(
              prettyprint(input, path, compareOptions)
                // \r has been replaced with /*CR*/ to test presence of CR in jest snapshots;
                // reverting this to get the right AST
                .replace(/\/\*CR\*\//g, "\r"),
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

  // \r is trimmed from jest snapshots by default;
  // manually replacing this character with /*CR*/ to test its true presence
  return result.formatted.replace(/\r/g, "/*CR*/");
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
          k => k === "rangeStart" || k === "rangeEnd" || k === "cursorOffset"
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
