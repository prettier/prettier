import baseConfig from "./rollup.base.config.js";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";
import * as path from "path";

const external = ["assert"];

if (process.env.BUILD_TARGET !== "website") {
  external.push(path.resolve("src/common/third-party.js"));
}

export default Object.assign(baseConfig, {
  entry: "web.js",
  dest: "dist/web.js",
  format: "umd",
  moduleName: "prettier",
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.versions": JSON.stringify(undefined),
      "process.platform": JSON.stringify(undefined),
      "process.env": JSON.stringify({}),
      "process.stdout": JSON.stringify(undefined),
      process: JSON.stringify(undefined),
      "process.argv": JSON.stringify([]),
      "path.parse": JSON.stringify(undefined),
      "process.binding('natives')": JSON.stringify([]),
      'eval("require")': "(function(){})",
      // See comment in jest.config.js
      "require('graceful-fs')": "require('fs')"
    }),
    json(),
    resolve({
      preferBuiltins: true,
      extensions: [".js", ".json"]
    }),
    commonjs()
  ],
  external,
  paths: {
    [path.resolve("src/common/third-party.js")]: "./third-party"
  }
});
