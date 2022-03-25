import createEsmUtils from "esm-utils";
import { replaceAlignedCode } from "./utils.mjs";

const { require } = createEsmUtils(import.meta);

/*
In typescript package, there are many block in shape like

```js
(function (ts) {
  // ...
})(ts || (ts = {}));
```
*/
function removeTypescriptModuleBlock(text, test) {
  if (typeof test === "string") {
    const testString = test;
    test = (text) => text.includes(testString);
  }

  return replaceAlignedCode(text, {
    start: "(function (ts) {",
    end: "})(ts || (ts = {}));",
    replacement: (part) => (test(part) ? "" : part),
  });
}

function replaceTypescriptModule(text) {
  // Deprecated apis
  text = removeTypescriptModuleBlock(
    text,
    "// The following are deprecations for the public API."
  );

  // Remove useless language service
  text = removeTypescriptModuleBlock(
    text,
    "ts.TypeScriptServicesFactory = TypeScriptServicesFactory;"
  );

  // Remove useless file accessing
  text = removeTypescriptModuleBlock(
    text,
    "ts.createSystemWatchFunctions = createSystemWatchFunctions;"
  );

  // Remove useless compiler
  text = removeTypescriptModuleBlock(
    text,
    "ts.convertCompilerOptionsFromJson = convertCompilerOptionsFromJson;"
  );

  // Remove useless performance
  text = removeTypescriptModuleBlock(
    text,
    "ts.tryGetNativePerformanceHooks = tryGetNativePerformanceHooks;"
  );
  text = removeTypescriptModuleBlock(
    text,
    "performance = ts.performance || (ts.performance = {})"
  );

  // Remove useless performance tracing
  text = removeTypescriptModuleBlock(
    text,
    "ts.startTracing = tracingEnabled.startTracing;"
  );

  // Remove useless path related
  text = removeTypescriptModuleBlock(text, "ts.resolvePath = resolvePath;");

  // Remove useless diagnosticMessages
  text = removeTypescriptModuleBlock(text, "ts.Diagnostics = {");



  // `typescript/lib/typescript.js` expose extra global objects
  // `TypeScript`, `toolsVersion`, `globalThis`
  text = replaceAlignedCode(text, {
    start: 'if (typeof process === "undefined" || process.browser) {',
    end: "}",
    replacement: "",
  });

  text = replaceAlignedCode(text, {
    start: "((function () {",
    end: "})());",
    replacement(part) {
      return part.includes("__magic__") ? "" : part;
    },
  });

  text = replaceAlignedCode(text, {
    start: "try {",
    end: "}",
    replacement(part) {
      return part.includes("require(etwModulePath)") ? "try {}" : part;
    },
  });

  text = replaceAlignedCode(text, {
    start: "if (ts.sys && ts.sys.require) {",
    end: "}",
    replacement: "",
  });

  require("fs").writeFileSync(
    require.resolve("typescript") + ".modified.js",
    text
  );

  return text;
}

export default replaceTypescriptModule;
