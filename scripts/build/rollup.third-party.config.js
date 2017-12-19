import baseConfig from "./rollup.base.config.js";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";

export default Object.assign(baseConfig, {
  entry: "src/common/third-party.js",
  dest: "dist/third-party.js",
  format: "cjs",
  plugins: [
    replace({
      // The require-from-string module (a dependency of cosmiconfig) assumes
      // that `module.parent` exists, but it only does for `require`:ed modules.
      // Usually, require-from-string is _always_ `require`:ed, but when bundled
      // with rollup the module is turned into a plain function located directly
      // in index.js so `module.parent` does not exist. Defaulting to `module`
      // instead seems to work.
      "module.parent": "(module.parent || module)"
    }),
    json(),
    resolve({ preferBuiltins: true }),
    commonjs()
  ],
  external: ["assert"]
});
