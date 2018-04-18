import path from "path";
import baseConfig from "./rollup.base.config.js";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import globals from "rollup-plugin-node-globals";
import json from "rollup-plugin-json";
import alias from "rollup-plugin-alias";

export default Object.assign(baseConfig, {
  entry: "index.js",
  dest: "prettier.js",
  format: "umd",
  plugins: [
    alias({
      [path.resolve("src/common/load-plugins.js")]: path.resolve(
        "src/common/load-plugins-browser.js"
      )
    }),
    json(),
    resolve({ preferBuiltins: true, extensions: [".js", ".json"] }),
    commonjs(),
    globals()
  ],
  useStrict: false,
  moduleName: "prettier",
  external: ["assert", "fs", "module"]
});
