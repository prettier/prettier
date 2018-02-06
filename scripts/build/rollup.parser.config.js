import baseConfig from "./rollup.base.config.js";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";
import uglify from "uglify-es";
import path from "path";

const parser = process.env.parser;

export default Object.assign(baseConfig, {
  entry: "src/" + parser + ".js",
  dest: "dist/" + path.basename(parser) + ".js",
  format: "cjs",
  plugins: [
    parser.endsWith("typescript")
      ? replace({
          "exports.Syntax =": "1,",
          include: "node_modules/typescript-eslint-parser/parser.js"
        })
      : {},
    // In flow-parser 0.59.0 there's a dynamic require: `require(s8)` which not
    // supported by rollup-plugin-commonjs, so we have to replace the variable
    // by its value before bundling.
    parser.endsWith("flow")
      ? replace({
          "require(tf)": 'require("fs")',
          include: "node_modules/flow-parser/flow_parser.js"
        })
      : {},
    json(),
    resolve({ preferBuiltins: true }),
    commonjs(
      parser.endsWith("glimmer")
        ? {
            namedExports: {
              "node_modules/handlebars/lib/index.js": ["parse"],
              "node_modules/simple-html-tokenizer/dist/simple-html-tokenizer.js": [
                "EntityParser",
                "HTML5NamedCharRefs",
                "EventedTokenizer"
              ],
              "node_modules/@glimmer/syntax/dist/modules/index.js": "default",
              "node_modules/@glimmer/syntax/dist/modules/es2017/index.js":
                "default"
            },
            ignore: ["source-map"]
          }
        : {}
    ),
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
  useStrict: !parser.endsWith("flow")
});
