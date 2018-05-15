import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import globals from "rollup-plugin-node-globals";
import json from "rollup-plugin-json";
import uglify from "uglify-es";

export default {
  input: "index.js",
  output: {
    file: "prettier.js",
    format: "umd",
    name: "prettier"
  },
  plugins: [
    resolve({
      preferBuiltins: true,
      extensions: [".js", ".json"],
      browser: true
    }),
    json(),
    commonjs(),
    globals()
  ],
  external: ["assert", "fs", "module"]
};
