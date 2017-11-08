import baseConfig from "./rollup.base.config.js";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";

export default Object.assign(baseConfig, {
  entry: "bin/prettier.js",
  dest: "dist/bin/prettier.js",
  format: "cjs",
  banner: "#!/usr/bin/env node",
  plugins: [
    replace({
      "#!/usr/bin/env node": "",
      // The require-from-string module (a dependency of cosmiconfig) assumes
      // that `module.parent` exists, but it only does for `require`:ed modules.
      // Usually, require-from-string is _always_ `require`:ed, but when bundled
      // with rollup the module is turned into a plain function located directly
      // in bin/prettier.js so `module.parent` does not exist. Defaulting to
      // `module` instead seems to work.
      "module.parent": "(module.parent || module)"
    }),
    json(),
    resolve({ preferBuiltins: true }),
    commonjs()
  ],
  external: ["fs", "readline", "path", "module", "assert", "util", "events"]
});
