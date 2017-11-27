import baseConfig from "./rollup.base.config.js";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";
import uglify from "uglify-es";

const parser = process.env.parser;

export default Object.assign(baseConfig, {
  entry: "src/parser-" + parser + ".js",
  dest: "dist/parser-" + parser + ".js",
  format: "cjs",
  plugins: [
    parser === "typescript"
      ? replace({
          "exports.Syntax =": "1,",
          include: "node_modules/typescript-eslint-parser/parser.js"
        })
      : {},
    // In flow-parser 0.59.0 there's a dynamic require: `require(s8)` which not
    // supported by rollup-plugin-commonjs, so we have to replace the variable
    // by its value before bundling.
    parser === "flow"
      ? replace({
          "require(s8)": 'require("fs")',
          include: "node_modules/flow-parser/flow_parser.js"
        })
      : {},
    json(),
    resolve({ preferBuiltins: true }),
    commonjs(),
    {
      transformBundle(code) {
        const result = uglify.minify(code, {});
        if (result.error) {
          throw result.error;
        }
        return result;
      }
    }
  ],
  external: [
    "fs",
    "buffer",
    "path",
    "module",
    "assert",
    "util",
    "os",
    "crypto"
  ],
  useStrict: parser !== "flow"
});
