// https://github.com/evanw/esbuild/commit/1916318ca7f803253dbdae0942af1c9a6d3a6910
const ESBUILD_MESSAGE_IDS = [
  "assign-to-constant",
  "call-import-namespace",
  "commonjs-variable-in-esm",
  "delete-super-property",
  "direct-eval",
  "duplicate-case",
  "duplicate-object-key",
  "empty-import-meta",
  "equals-nan",
  "equals-negative-zero",
  "equals-new-object",
  "html-comment-in-js",
  "impossible-typeof",
  "private-name-will-throw",
  "semicolon-after-return",
  "suspicious-boolean-not",
  "this-is-undefined-in-esm",
  "unsupported-dynamic-import",
  "unsupported-jsx-comment",
  "unsupported-regexp",
  "unsupported-require-call",
  "different-path-case",
  "ignored-bare-import",
  "ignored-dynamic-import",
  "import-is-undefined",
  "package.json",
  "require-resolve-not-external",
  "tsconfig.json",
];
const logOverride = Object.fromEntries(
  ESBUILD_MESSAGE_IDS.map((id) => [id, "warning"])
);

export default function esbuildPluginThrowWarnings({ allowDynamicRequire }) {
  return {
    name: "throw-warnings",
    setup(build) {
      const options = build.initialOptions;
      options.logOverride = {
        ...logOverride,
        ...options.logOverride,
      };

      build.onEnd((result) => {
        if (result.errors.length > 0) {
          return;
        }

        for (const warning of result.warnings) {
          if (
            allowDynamicRequire &&
            warning.text ===
              'This call to "require" will not be bundled because the argument is not a string literal'
          ) {
            continue;
          }

          if (
            [
              "node_modules/flow-parser/flow_parser.js",
              "dist/_parser-flow.js.umd.js",
              "dist/_parser-flow.js.esm.mjs",
            ].includes(warning.location.file) &&
            warning.text ===
              "This case clause will never be evaluated because it duplicates an earlier case clause"
          ) {
            continue;
          }

          console.log(warning);
          throw new Error(warning.text);
        }
      });
    },
  };
}
