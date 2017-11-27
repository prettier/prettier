import baseConfig from "./rollup.base.config.js";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";
import * as path from "path";

const external = ["assert"];

if (process.env.BUILD_TARGET !== "website") {
  external.push(path.resolve("src/third-party.js"));
}

export default Object.assign(baseConfig, {
  entry: "index.js",
  dest: "dist/index.js",
  format: "cjs",
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    json(),
    resolve({ preferBuiltins: true }),
    commonjs()
  ],
  external,
  paths: {
    [path.resolve("src/third-party.js")]: "./third-party"
  }
});
