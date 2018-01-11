import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import uglify from "rollup-plugin-uglify";
import hashbang from "rollup-plugin-hashbang";
import { minify } from "uglify-es";
import path from "path";

const externals = require("./externals");

const paths = externals.reduce(
  (obj, external) =>
    Object.assign(obj, {
      [external.name]: `./externals/${external.outName || external.name}`
    }),
  {}
);

// const globals = externals.reduce(
//   (obj, external) => Object.assign(obj, { [external.name]: external.name }),
//   {}
// );

const plugins = [
  json(),
  resolve({
    preferBuiltins: true,
    extensions: [".js", ".json"]
  }),
  commonjs({
    ignore: externals.map(external => external.name)
  }),
  uglify({}, minify)
];

const builtins = [
  "fs",
  "buffer",
  "path",
  "module",
  "assert",
  "util",
  "os",
  "crypto",
  ...externals.map(external => external.name)
];

const onwarn = warning => {
  if (warning.code === "EVAL" || warning.code === "UNRESOLVED_IMPORT") {
    return;
  }

  console.warn(warning.message);
};

const indexPath = path.resolve("./index.js");

const cliConfig = {
  input: "bin/prettier.js",
  output: {
    file: "dist/bin/prettier.js",
    format: "cjs",
    paths: Object.assign({}, paths, {
      [indexPath]: "../index"
    })
  },
  plugins: [hashbang(), ...plugins],
  external: builtins.concat(indexPath),
  onwarn
};

const indexConfig = {
  input: "index.js",
  output: {
    file: "dist/index.js",
    format: "cjs",
    paths
  },
  plugins,
  external: builtins,
  onwarn
};

export default [cliConfig, indexConfig];
