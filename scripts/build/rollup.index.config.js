import baseConfig from "./rollup.base.config.js";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import * as path from "path";

export default Object.assign(baseConfig, {
  entry: "index.js",
  dest: "dist/index.js",
  format: "cjs",
  plugins: [json(), resolve({ preferBuiltins: true }), commonjs()],
  external: ["assert", path.resolve("src/third-party.js")],
  paths: {
    [path.resolve("src/third-party.js")]: "./third-party"
  }
});
