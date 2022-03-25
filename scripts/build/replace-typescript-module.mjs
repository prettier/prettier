import createEsmUtils from "esm-utils";
import { replaceAlignedCode } from "./utils.mjs";

const { require } = createEsmUtils(import.meta);

/*
In typescript package, there are many block in shape like

```js
var ts;
(function (ts) {
  // ...
})(ts || (ts = {}));
```
*/
function removeBlock(text, test) {
  if (typeof test === "string") {
    const testString = test;
    test = (text) => text.includes(testString);
  }

  return replaceAlignedCode(text, {
    start: "var ts;\n(function (ts) {",
    end: "})(ts || (ts = {}));",
    replacement: (part) => (test(part) ? "" : part),
  });
}

function replaceTypescriptModule(text) {
  // Deprecated apis
  text = removeBlock(
    text,
    "// The following are deprecations for the public API."
  );

  // Remove useless language service
  text = removeBlock(
    text,
    "ts.TypeScriptServicesFactory = TypeScriptServicesFactory;"
  );

  // Remove useless file accessing
  text = removeBlock(
    text,
    "ts.createSystemWatchFunctions = createSystemWatchFunctions;"
  );

  // Remove useless compiler
  text = removeBlock(
    text,
    "ts.convertCompilerOptionsFromJson = convertCompilerOptionsFromJson;"
  );

  // Remove useless performance
  text = removeBlock(
    text,
    "ts.tryGetNativePerformanceHooks = tryGetNativePerformanceHooks;"
  );
  text = removeBlock(
    text,
    "performance = ts.performance || (ts.performance = {})"
  );

  // Remove useless performance tracing
  text = removeBlock(
    text,
    "ts.startTracing = tracingEnabled.startTracing;"
  );
  text = removeBlock(
    text,
    "ts.trace = trace;"
  );

  // Remove useless path related
  // text = removeBlock(text, "ts.resolvePath = resolvePath;");

  // Remove useless diagnosticMessages
  // text = removeBlock(text, "ts.Diagnostics = {");
  text = removeBlock(
    text,
    "ts.sortAndDeduplicateDiagnostics = sortAndDeduplicateDiagnostics;"
  );

  text = removeBlock(
    text,
    "ts.createSourceMapGenerator = createSourceMapGenerator;"
  );
  text = removeBlock(
    text,
    "ts.isBuildInfoFile = isBuildInfoFile;"
  );
  text = removeBlock(
    text,
    "ts.findConfigFile = findConfigFile;"
  );
  text = removeBlock(
    text,
    "ts.createBuilderProgram = createBuilderProgram;"
  );
  text = removeBlock(
    text,
    "moduleSpecifiers = ts.moduleSpecifiers || (ts.moduleSpecifiers = {})"
  );
  text = removeBlock(
    text,
    "ts.resolveConfigFileProjectName = resolveConfigFileProjectName;"
  );
  text = removeBlock(
    text,
    "Completions = ts.Completions || (ts.Completions = {})"
  );
  text = removeBlock(
    text,
    "DocumentHighlights = ts.DocumentHighlights || (ts.DocumentHighlights = {})"
  );
  text = removeBlock(
    text,
    "ts.createDocumentRegistry = createDocumentRegistry;"
  );
  text = removeBlock(
    text,
    "FindAllReferences = ts.FindAllReferences || (ts.FindAllReferences = {})"
  );
  text = removeBlock(
    text,
    "CallHierarchy = ts.CallHierarchy || (ts.CallHierarchy = {})"
  );
  text = removeBlock(
    text,
    "ts.getEditsForFileRename = getEditsForFileRename;"
  );
  text = removeBlock(
    text,
    "GoToDefinition = ts.GoToDefinition || (ts.GoToDefinition = {})"
  );
  text = removeBlock(
    text,
    "JsDoc = ts.JsDoc || (ts.JsDoc = {})"
  );
  text = removeBlock(
    text,
    "NavigateTo = ts.NavigateTo || (ts.NavigateTo = {})"
  );
  text = removeBlock(
    text,
    "NavigationBar = ts.NavigationBar || (ts.NavigationBar = {})"
  );
  text = removeBlock(
    text,
    "OrganizeImports = ts.OrganizeImports || (ts.OrganizeImports = {})"
  );
  text = removeBlock(
    text,
    "classifier = ts.classifier || (ts.classifier = {})"
  );

  //
  text = removeBlock(
    text,
    "ts.getScriptTargetFeatures = getScriptTargetFeatures;"
  );

  //
  text = removeBlock(
    text,
    "BuilderState = ts.BuilderState || (ts.BuilderState = {})"
  );

  //
  text = removeBlock(
    text,
    "codefix = ts.codefix || (ts.codefix = {})"
  );
  text = removeBlock(
    text,
    "BreakpointResolver = ts.BreakpointResolver || (ts.BreakpointResolver = {})"
  );
  text = removeBlock(
    text,
    "ts.transform = transform;"
  );
  text = removeBlock(
    text,
    "ts.getDefaultLibFilePath = getDefaultLibFilePath;"
  );
  text = removeBlock(
    text,
    "refactor = ts.refactor || (ts.refactor = {})"
  );
  text = removeBlock(
    text,
    "textChanges = ts.textChanges || (ts.textChanges = {})"
  );
  text = removeBlock(
    text,
    "formatting = ts.formatting || (ts.formatting = {})"
  );
  text = removeBlock(
    text,
    "ts.fixupCompilerOptions = fixupCompilerOptions;"
  );
  text = removeBlock(
    text,
    "SymbolDisplay = ts.SymbolDisplay || (ts.SymbolDisplay = {})"
  );
  text = removeBlock(
    text,
    "ts.canBeConvertedToAsync = canBeConvertedToAsync;"
  );
  text = removeBlock(
    text,
    "ts.getSourceMapper = getSourceMapper;"
  );
  text = removeBlock(
    text,
    "InlayHints = ts.InlayHints || (ts.InlayHints = {})"
  );
  text = removeBlock(
    text,
    "SignatureHelp = ts.SignatureHelp || (ts.SignatureHelp = {})"
  );
  text = removeBlock(
    text,
    "SmartSelectionRange = ts.SmartSelectionRange || (ts.SmartSelectionRange = {})"
  );
  text = removeBlock(
    text,
    "Rename = ts.Rename || (ts.Rename = {})"
  );
  text = removeBlock(
    text,
    "ts.preProcessFile = preProcessFile;"
  );


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
