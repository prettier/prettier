/*
Open https://esbuild.github.io/api/#log-override, run

```js
[...document.querySelectorAll('details > summary > code')].map(code => code.textContent)
```

in console to get all message ids.
*/
const ESBUILD_MESSAGE_IDS = [
  "assign-to-constant",
  "assign-to-import",
  "call-import-namespace",
  "commonjs-variable-in-esm",
  "delete-super-property",
  "duplicate-case",
  "duplicate-object-key",
  "empty-import-meta",
  "equals-nan",
  "equals-negative-zero",
  "equals-new-object",
  "html-comment-in-js",
  "impossible-typeof",
  "indirect-require",
  "private-name-will-throw",
  "semicolon-after-return",
  "suspicious-boolean-not",
  "this-is-undefined-in-esm",
  "unsupported-dynamic-import",
  "unsupported-jsx-comment",
  "unsupported-regexp",
  "unsupported-require-call",
  "css-syntax-error",
  "invalid-@charset",
  "invalid-@import",
  "invalid-@nest",
  "invalid-@layer",
  "invalid-calc",
  "js-comment-in-css",
  "unsupported-@charset",
  "unsupported-@namespace",
  "unsupported-css-property",
  "ambiguous-reexport",
  "different-path-case",
  "ignored-bare-import",
  "ignored-dynamic-import",
  "import-is-undefined",
  "require-resolve-not-external",
  "invalid-source-mappings",
  "sections-in-source-map",
  "missing-source-map",
  "unsupported-source-map-comment",
  "package.json",
  "tsconfig.json",
];
const logOverride = Object.fromEntries(
  ESBUILD_MESSAGE_IDS.map((id) => [id, "warning"]),
);

export default function esbuildPluginThrowWarnings({
  allowDynamicRequire,
  allowDynamicImport,
}) {
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
            ["unsupported-require-call", "indirect-require"].includes(
              warning.id,
            )
          ) {
            continue;
          }

          if (
            allowDynamicImport &&
            warning.id === "unsupported-dynamic-import"
          ) {
            continue;
          }

          if (
            [
              "node_modules/flow-parser/flow_parser.js",
              "dist/_parser-flow.js.umd.js",
              "dist/_parser-flow.js.esm.mjs",
            ].includes(warning.location.file) &&
            warning.id === "duplicate-case"
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
