import path from "node:path";
import escapeStringRegexp from "escape-string-regexp";
import { outdent } from "outdent";
import { writeFile, PROJECT_ROOT } from "../utils/index.mjs";

/*
Root submodule in `typescript.js` are bundled like

```js
var ts;
(function (ts) {
  // Submodule
})(ts || (ts = {}));
```
*/

const SUBMODULE_START = escapeStringRegexp("var ts;\n(function (ts) {");
const SUBMODULE_END = escapeStringRegexp("})(ts || (ts = {}));");

function getSubmodules(text, testFunction) {
  const regexp = new RegExp(
    [
      "(?<=\n)",
      `(?<before>${SUBMODULE_START})`,
      "(?=\n)",
      "(?<text>.*?)",
      "(?<=\n)",
      `(?<after>${SUBMODULE_END})`,
      "(?=\n)",
    ].join(""),
    "gsu"
  );

  return [...text.matchAll(regexp)]
    .filter((match) => testFunction(match.groups.text))
    .map((match) => ({
      start: match.index,
      end: match.index + match[0].length,
      ...match.groups,
    }));
}

function removeSubmodule(text, testFunction) {
  return replaceSubmodule(text, testFunction, "");
}

function replaceSubmodule(text, testFunction, replacement) {
  const modules = getSubmodules(text, testFunction);
  if (modules.length !== 1) {
    return text;
    // TODO: Enable this check when merge to `next` branch
    // throw Object.assign(
    //   new Error(
    //     `Expect exactly one submodule to be found, got ${modules.length} submodules.`
    //   ),
    //   { modules }
    // );
  }

  const [{ start, end, before, after }] = modules;
  if (replacement) {
    replacement = before + "\n" + replacement + "\n" + after;
  }

  return text.slice(0, start) + replacement + text.slice(end);
}

function removeMultipleSubmodules(text, testFunction) {
  let modules = getSubmodules(text, testFunction);

  if (modules.length < 2) {
    throw new Error("Expect more than one submodules to be found");
  }

  for (; modules.length > 0; modules = getSubmodules(text, testFunction)) {
    const [{ start, end }] = modules;
    text = text.slice(0, start) + text.slice(end);
  }

  return text;
}

function replaceAlignedCode(text, { start, end, replacement = "" }) {
  const regexp = new RegExp(
    [
      "(?<=\n)",
      "(?<indentString>\\s*)",
      escapeStringRegexp(start),
      ".*?",
      "(?<=\n)",
      "\\k<indentString>",
      escapeStringRegexp(end),
      "(?=\n)",
    ].join(""),
    "gsu"
  );

  return text.replaceAll(regexp, replacement);
}

function modifyTypescriptModule(text) {
  // Code after `globalThis` shim are useless
  const positionOfGlobalThisShim = text.indexOf(
    "// We polyfill `globalThis` here so re can reliably patch the global scope"
  );
  if (positionOfGlobalThisShim === -1) {
    throw new Error("Unexpected source.");
  }
  text = text.slice(0, positionOfGlobalThisShim) + "module.exports = ts;";

  // File system
  text = removeSubmodule(text, (text) =>
    text.includes("ts.generateDjb2Hash = generateDjb2Hash;")
  );

  // Language service
  text = removeSubmodule(text, (text) =>
    text.includes("ts.TypeScriptServicesFactory = TypeScriptServicesFactory;")
  );

  // `ts.Version`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.Version = Version;")
  );

  // `ts.transform`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transform = transform;")
  );

  // `ts.BreakpointResolver`
  text = removeSubmodule(text, (text) =>
    text.trimStart().startsWith("var BreakpointResolver;")
  );

  // `ts.textChanges`
  text = removeSubmodule(text, (text) =>
    text.trimStart().startsWith("var textChanges;")
  );

  // `ts.preProcessFile`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.preProcessFile = preProcessFile;")
  );

  // `ts.Rename`
  text = removeSubmodule(text, (text) =>
    text.trimStart().startsWith("var Rename;")
  );

  // `ts.SmartSelectionRange`
  text = removeSubmodule(text, (text) =>
    text.trimStart().startsWith("var SmartSelectionRange;")
  );

  // `ts.SignatureHelp`
  text = removeSubmodule(text, (text) =>
    text.trimStart().startsWith("var SignatureHelp;")
  );

  // `ts.InlayHints`
  text = removeSubmodule(text, (text) =>
    text.trimStart().startsWith("var InlayHints;")
  );

  // Sourcemap
  text = removeSubmodule(text, (text) =>
    text.includes("ts.getSourceMapper = getSourceMapper;")
  );
  text = removeSubmodule(text, (text) =>
    text.includes("ts.createSourceMapGenerator = createSourceMapGenerator;")
  );

  // Suggestion
  text = removeSubmodule(text, (text) =>
    text.includes(
      "ts.computeSuggestionDiagnostics = computeSuggestionDiagnostics;"
    )
  );

  // Tracing
  text = removeSubmodule(text, (text) =>
    text.includes("ts.startTracing = tracingEnabled.startTracing;")
  );

  // Diagnostics
  text = removeSubmodule(text, (text) =>
    text.includes("ts.createProgramHost = createProgramHost;")
  );

  // `ts.transformTypeScript`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformTypeScript = transformTypeScript;")
  );

  // `ts.createRuntimeTypeSerializer`
  text = removeSubmodule(text, (text) =>
    text.includes(
      "ts.createRuntimeTypeSerializer = createRuntimeTypeSerializer;"
    )
  );

  // Transform
  // `ts.transformLegacyDecorators`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformLegacyDecorators = transformLegacyDecorators;")
  );
  // `ts.transformES5`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformES5 = transformES5;")
  );
  // `ts.transformES2015`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformES2015 = transformES2015;")
  );
  // `ts.transformES2016`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformES2016 = transformES2016;")
  );
  // `ts.transformES2017` & `ts.createSuperAccessVariableStatement`
  text = removeSubmodule(
    text,
    (text) =>
      text.includes("ts.transformES2017 = transformES2017;") &&
      text.includes(
        "ts.createSuperAccessVariableStatement = createSuperAccessVariableStatement;"
      )
  );
  // `ts.transformES2018`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformES2018 = transformES2018;")
  );
  // `ts.transformES2019`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformES2019 = transformES2019;")
  );
  // `ts.transformES2020`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformES2020 = transformES2020;")
  );
  // `ts.transformES2021`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformES2021 = transformES2021;")
  );
  // `ts.transformESNext`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformESNext = transformESNext;")
  );
  // `ts.transformJsx`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformJsx = transformJsx;")
  );
  // `ts.transformGenerators`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformGenerators = transformGenerators;")
  );
  // `ts.transformModule`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformModule = transformModule;")
  );
  // `ts.transformSystemModule`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformSystemModule = transformSystemModule;")
  );
  // `ts.transformECMAScriptModule`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformECMAScriptModule = transformECMAScriptModule;")
  );
  // `ts.transformNodeModule`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformNodeModule = transformNodeModule;")
  );
  // `ts.transformClassFields`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformClassFields = transformClassFields;")
  );
  // `ts.transformDeclarations`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformDeclarations = transformDeclarations;")
  );
  // `ts.transformNodes` and more
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transformNodes = transformNodes;")
  );

  // `ts.server`
  text = removeSubmodule(text, (text) => text.includes("(ts.server = {})"));

  // `ts.JsTyping`
  text = removeSubmodule(text, (text) => text.includes("(ts.JsTyping = {})"));

  // `ts.ClassificationType`
  text = removeSubmodule(text, (text) =>
    text.includes("(ts.ClassificationType = {})")
  );

  // Build
  text = removeSubmodule(text, (text) =>
    text.includes("ts.createSolutionBuilder = createSolutionBuilder;")
  );
  text = removeSubmodule(text, (text) =>
    text.includes("ts.parseBuildCommand = parseBuildCommand;")
  );
  text = removeSubmodule(text, (text) =>
    text.includes("ts.createBuilderProgram = createBuilderProgram;")
  );
  text = removeSubmodule(text, (text) =>
    text.includes(
      "ts.createSemanticDiagnosticsBuilderProgram = createSemanticDiagnosticsBuilderProgram;"
    )
  );
  text = removeSubmodule(text, (text) =>
    text.includes("ts.createResolutionCache = createResolutionCache;")
  );
  text = removeSubmodule(text, (text) =>
    text.includes("ts.createWatchCompilerHost = createWatchCompilerHost;")
  );
  text = removeSubmodule(text, (text) =>
    text.includes(
      "ts.resolveConfigFileProjectName = resolveConfigFileProjectName;"
    )
  );
  text = removeSubmodule(text, (text) =>
    text.includes("ts.getBuildInfo = getBuildInfo;")
  );

  // Compile
  text = removeSubmodule(text, (text) =>
    text.includes("ts.createCompilerHost = createCompilerHost;")
  );
  text = removeSubmodule(text, (text) =>
    text.includes("(ts.BuilderState = {})")
  );
  text = removeSubmodule(text, (text) =>
    text.includes("ts.transpile = transpile;")
  );

  // Watch
  text = removeSubmodule(text, (text) =>
    text.includes("ts.getWatchFactory = getWatchFactory;")
  );

  // `ts.canProduceDiagnostics`, `ts.createGetSymbolAccessibilityDiagnosticForNode`, and `ts.createGetSymbolAccessibilityDiagnosticForNode`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.canProduceDiagnostics = canProduceDiagnostics;")
  );

  // `ts.moduleSpecifiers`
  text = removeSubmodule(text, (text) =>
    text.includes("(ts.moduleSpecifiers = {})")
  );

  // `ts.trace`
  text = removeSubmodule(text, (text) => text.includes("ts.trace = trace;"));

  // `ts.createTypeChecker`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.createTypeChecker = createTypeChecker;")
  );

  // `ts.DocumentHighlights`
  text = removeSubmodule(text, (text) =>
    text.includes("(ts.DocumentHighlights = {})")
  );

  // `ts.createDocumentRegistry`
  text = removeSubmodule(text, (text) =>
    text.includes("ts.createDocumentRegistry = createDocumentRegistry;")
  );

  // `ts.CallHierarchy`
  text = removeSubmodule(text, (text) =>
    text.includes("(ts.CallHierarchy = {})")
  );

  // `ts.flattenDestructuringAssignment` and `ts.flattenDestructuringBinding`
  text = removeSubmodule(
    text,
    (text) =>
      text.includes(
        "ts.flattenDestructuringAssignment = flattenDestructuringAssignment"
      ) &&
      text.includes(
        "ts.flattenDestructuringBinding = flattenDestructuringBinding"
      )
  );

  // `ts.processTaggedTemplateExpression`
  text = removeSubmodule(text, (text) =>
    text.includes(
      "ts.processTaggedTemplateExpression = processTaggedTemplateExpression"
    )
  );

  // Editor
  text = removeSubmodule(text, (text) =>
    text.includes("ts.getEditsForFileRename = getEditsForFileRename;")
  );
  text = removeSubmodule(text, (text) =>
    text.includes("(ts.GoToDefinition = {})")
  );
  text = removeSubmodule(text, (text) => text.includes("(ts.JsDoc = {})"));
  text = removeSubmodule(text, (text) => text.includes("(ts.NavigateTo = {})"));
  text = removeSubmodule(text, (text) =>
    text.includes("(ts.NavigationBar = {})")
  );
  text = removeSubmodule(text, (text) =>
    text.includes("(ts.OrganizeImports = {})")
  );
  text = removeSubmodule(text, (text) =>
    text.includes("(ts.OutliningElementsCollector = {})")
  );
  text = removeSubmodule(text, (text) =>
    text.includes("ts.createPatternMatcher = createPatternMatcher;")
  );
  text = removeSubmodule(text, (text) =>
    text.includes("(ts.SymbolDisplay = {})")
  );

  // `ts.refactor` (multiple)
  text = removeMultipleSubmodules(text, (text) =>
    text.trimStart().startsWith("var refactor;")
  );

  // `ts.codefix` (multiple)
  text = removeMultipleSubmodules(text, (text) =>
    text.trimStart().startsWith("var codefix;")
  );

  // `ts.formatting` (multiple)
  text = removeMultipleSubmodules(text, (text) =>
    text.trimStart().startsWith("var formatting;")
  );

  // `ts.Completions` (multiple)
  text = removeMultipleSubmodules(text, (text) =>
    text.trimStart().startsWith("var Completions;")
  );

  // `ts.FindAllReferences` (multiple)
  text = removeMultipleSubmodules(text, (text) =>
    text.trimStart().startsWith("var FindAllReferences;")
  );

  // Performance
  text = replaceSubmodule(
    text,
    (text) =>
      text.includes(
        "ts.tryGetNativePerformanceHooks = tryGetNativePerformanceHooks;"
      ),
    outdent`
      ts.tryGetNativePerformanceHooks = () => {};
      ts.timestamp = Date.now;
    `
  );

  for (const [find, replacement] of Object.entries({
    // yarn pnp
    "process.versions.pnp": "undefined",

    // Dynamic `require()`s
    "ts.sys && ts.sys.require": "false",
    "require(etwModulePath)": "undefined",
  })) {
    text = text.replaceAll(find, replacement);
  }

  text = replaceAlignedCode(text, {
    start: "var debugObjectHost = (function () {",
    end: "})();",
  });

  return text;
}

// Save modified code to `{PROJECT_ROOT}/.tmp/modified-typescript.js` for debug
const saveOutputToDisk = (process) => (text) => {
  const result = process(text);
  writeFile(path.join(PROJECT_ROOT, ".tmp/modified-typescript.js"), result);
  return result;
};

export default saveOutputToDisk(modifyTypescriptModule);
