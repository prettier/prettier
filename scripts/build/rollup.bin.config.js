import baseConfig from "./rollup.base.config.js";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";
import * as path from "path";

export default Object.assign(baseConfig, {
  entry: "bin/prettier.js",
  dest: "dist/bin/prettier.js",
  format: "cjs",
  banner: "#!/usr/bin/env node",
  plugins: [
    replace({ "#!/usr/bin/env node": "" }),
    json(),
    resolve({ preferBuiltins: true }),
    commonjs()
  ],
  external: [
    "fs",
    "readline",
    "path",
    "module",
    "assert",
    "util",
    "events",
    path.resolve("src/third-party.js")
  ],
  paths: {
    [path.resolve("src/third-party.js")]: "../third-party"
  }
});
