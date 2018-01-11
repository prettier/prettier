import resolve from "rollup-plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";
import uglify from "rollup-plugin-uglify";
import { minify } from "uglify-es";

const externals = require("./externals");

const builtinNames = [
  "fs",
  "buffer",
  "path",
  "module",
  "assert",
  "util",
  "os",
  "crypto"
];

export default externals.map(external => ({
  input: require.resolve(external.name),
  output: {
    file: `dist/externals/${external.outName || external.name}.js`,
    format: external.browser === false ? "cjs" : "umd",
    name: external.name,
    exports: "named",
    strict: !external.loose
  },
  external: external.browser === false ? builtinNames : [],
  plugins: [
    ...(externals.extraPlugins || []),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    json(),
    resolve({
      preferBuiltins: true,
      extensions: [".js", ".json"]
    }),
    commonjs(),
    ...(external.browser === false ? [] : [builtins(), globals()]),
    external.noMinify || uglify({}, minify)
  ]
}));
