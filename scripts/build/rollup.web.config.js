import path from "path";
import baseConfig from "./rollup.base.config.js";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import globals from "rollup-plugin-node-globals";
import json from "rollup-plugin-json";
import alias from "rollup-plugin-alias";

export default Object.assign(baseConfig, {
  input: "index.js",
  output: {
    file: "prettier.js",
    format: "umd",
    name: "prettier"
  },
  plugins: [
    resolve({ preferBuiltins: true, extensions: [".js", ".json"] }),
    alias({
      [path.resolve("src/common/load-plugins.js")]: path.resolve(
        "src/common/load-plugins-browser.js"
      )
    }),
    json(),
    commonjs(),
    globals()
  ],
  external: ["assert", "fs", "module"]
});
