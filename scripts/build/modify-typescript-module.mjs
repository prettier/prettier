import path from "node:path";
import escapeStringRegexp from "escape-string-regexp";
import { outdent } from "outdent";
import MagicString from "magic-string";
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

function getSubmodules(text) {
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

  return [...text.matchAll(regexp)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
    ...match.groups,
  }));
}

class TypeScriptModuleSource {
  #source;
  #modules;

  constructor(text) {
    this.#source = new MagicString(text);
    this.#modules = getSubmodules(text);
  }

  removeSubmodule(testFunction) {
    return this.replaceSubmodule(testFunction, "");
  }

  replaceSubmodule(testFunction, replacement) {
    const modules = this.#modules.filter(({ text }) => testFunction(text));
    if (modules.length !== 1) {
      return this;

      // TODO: Enable this check when merge to `next` branch
      // throw Object.assign(
      //   new Error(
      //     `Expect exactly one submodule to be found, got ${modules.length} submodules.`
      //   ),
      //   { modules }
      // );
    }

    const [{ start, end, before, after }] = modules;
    if (!replacement) {
      this.#source.remove(start, end);
    } else {
      this.#source.overwrite(
        start,
        end,
        before + "\n" + replacement + "\n" + after
      );
    }
    return this;
  }

  removeMultipleSubmodules(testFunction) {
    const modules = this.#modules.filter(({ text }) => testFunction(text));

    if (modules.length < 2) {
      throw new Error("Expect more than one submodules to be found");
    }

    for (const { start, end } of modules) {
      this.#source.remove(start, end);
    }
    return this;
  }

  replaceAlignedCode({ start, end, replacement = "" }) {
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

    this.#source.replaceAll(regexp, replacement);
    return this;
  }

  remove(...args) {
    this.#source.remove(...args);
    return this;
  }

  append(...args) {
    this.#source.append(...args);
    return this;
  }

  replaceAll(...args) {
    this.#source.replaceAll(...args);
    return this;
  }

  toString() {
    return this.#source.toString();
  }
}

function modifyTypescriptModule(text) {
  const source = new TypeScriptModuleSource(text);

  // Code after `globalThis` shim are useless
  const positionOfGlobalThisShim = text.indexOf(
    "// We polyfill `globalThis` here so re can reliably patch the global scope"
  );
  if (positionOfGlobalThisShim === -1) {
    throw new Error("Unexpected source.");
  }
  source.remove(positionOfGlobalThisShim, text.length);
  source.append("module.exports = ts;");

  // File system
  source.removeSubmodule((text) =>
    text.includes("ts.generateDjb2Hash = generateDjb2Hash;")
  );

  // Language service
  source.removeSubmodule((text) =>
    text.includes("ts.TypeScriptServicesFactory = TypeScriptServicesFactory;")
  );

  // `ts.Version`
  source.removeSubmodule((text) => text.includes("ts.Version = Version;"));

  // `ts.transform`
  source.removeSubmodule((text) => text.includes("ts.transform = transform;"));

  // `ts.BreakpointResolver`
  source.removeSubmodule((text) =>
    text.trimStart().startsWith("var BreakpointResolver;")
  );

  // `ts.textChanges`
  source.removeSubmodule((text) =>
    text.trimStart().startsWith("var textChanges;")
  );

  // `ts.preProcessFile`
  source.removeSubmodule((text) =>
    text.includes("ts.preProcessFile = preProcessFile;")
  );

  // `ts.Rename`
  source.removeSubmodule((text) => text.trimStart().startsWith("var Rename;"));

  // `ts.SmartSelectionRange`
  source.removeSubmodule((text) =>
    text.trimStart().startsWith("var SmartSelectionRange;")
  );

  // `ts.SignatureHelp`
  source.removeSubmodule((text) =>
    text.trimStart().startsWith("var SignatureHelp;")
  );

  // `ts.InlayHints`
  source.removeSubmodule((text) =>
    text.trimStart().startsWith("var InlayHints;")
  );

  // Sourcemap
  source
    .removeSubmodule((text) =>
      text.includes("ts.getSourceMapper = getSourceMapper;")
    )
    .removeSubmodule((text) =>
      text.includes("ts.createSourceMapGenerator = createSourceMapGenerator;")
    );

  // Suggestion
  source.removeSubmodule((text) =>
    text.includes(
      "ts.computeSuggestionDiagnostics = computeSuggestionDiagnostics;"
    )
  );

  // Tracing
  source.removeSubmodule((text) =>
    text.includes("ts.startTracing = tracingEnabled.startTracing;")
  );

  // Diagnostics
  source.removeSubmodule((text) =>
    text.includes("ts.createProgramHost = createProgramHost;")
  );

  // `ts.transformTypeScript`
  source.removeSubmodule((text) =>
    text.includes("ts.transformTypeScript = transformTypeScript;")
  );

  // `ts.createRuntimeTypeSerializer`
  source.removeSubmodule((text) =>
    text.includes(
      "ts.createRuntimeTypeSerializer = createRuntimeTypeSerializer;"
    )
  );

  // Transform
  source
    // `ts.transformLegacyDecorators`
    .removeSubmodule((text) =>
      text.includes("ts.transformLegacyDecorators = transformLegacyDecorators;")
    )
    // `ts.transformES5`
    .removeSubmodule((text) => text.includes("ts.transformES5 = transformES5;"))
    // `ts.transformES2015`
    .removeSubmodule((text) =>
      text.includes("ts.transformES2015 = transformES2015;")
    )
    // `ts.transformES2016`
    .removeSubmodule((text) =>
      text.includes("ts.transformES2016 = transformES2016;")
    )
    // `ts.transformES2017` & `ts.createSuperAccessVariableStatement`
    .removeSubmodule(
      (text) =>
        text.includes("ts.transformES2017 = transformES2017;") &&
        text.includes(
          "ts.createSuperAccessVariableStatement = createSuperAccessVariableStatement;"
        )
    )
    // `ts.transformES2018`
    .removeSubmodule((text) =>
      text.includes("ts.transformES2018 = transformES2018;")
    )
    // `ts.transformES2019`
    .removeSubmodule((text) =>
      text.includes("ts.transformES2019 = transformES2019;")
    )
    // `ts.transformES2020`
    .removeSubmodule((text) =>
      text.includes("ts.transformES2020 = transformES2020;")
    )
    // `ts.transformES2021`
    .removeSubmodule((text) =>
      text.includes("ts.transformES2021 = transformES2021;")
    )
    // `ts.transformESNext`
    .removeSubmodule((text) =>
      text.includes("ts.transformESNext = transformESNext;")
    )
    // `ts.transformJsx`
    .removeSubmodule((text) => text.includes("ts.transformJsx = transformJsx;"))
    // `ts.transformGenerators`
    .removeSubmodule((text) =>
      text.includes("ts.transformGenerators = transformGenerators;")
    )
    // `ts.transformModule`
    .removeSubmodule((text) =>
      text.includes("ts.transformModule = transformModule;")
    )
    // `ts.transformSystemModule`
    .removeSubmodule((text) =>
      text.includes("ts.transformSystemModule = transformSystemModule;")
    )
    // `ts.transformECMAScriptModule`
    .removeSubmodule((text) =>
      text.includes("ts.transformECMAScriptModule = transformECMAScriptModule;")
    )
    // `ts.transformNodeModule`
    .removeSubmodule((text) =>
      text.includes("ts.transformNodeModule = transformNodeModule;")
    )
    // `ts.transformClassFields`
    .removeSubmodule((text) =>
      text.includes("ts.transformClassFields = transformClassFields;")
    )
    // `ts.transformDeclarations`
    .removeSubmodule((text) =>
      text.includes("ts.transformDeclarations = transformDeclarations;")
    );

  // `ts.transformNodes` and more
  source.removeSubmodule((text) =>
    text.includes("ts.transformNodes = transformNodes;")
  );

  // `ts.server`
  source.removeSubmodule((text) => text.includes("(ts.server = {})"));

  // `ts.JsTyping`
  source.removeSubmodule((text) => text.includes("(ts.JsTyping = {})"));

  // `ts.ClassificationType`
  source.removeSubmodule((text) =>
    text.includes("(ts.ClassificationType = {})")
  );

  // Build
  source
    .removeSubmodule((text) =>
      text.includes("ts.createSolutionBuilder = createSolutionBuilder;")
    )
    .removeSubmodule((text) =>
      text.includes("ts.parseBuildCommand = parseBuildCommand;")
    )
    .removeSubmodule((text) =>
      text.includes("ts.createBuilderProgram = createBuilderProgram;")
    )
    .removeSubmodule((text) =>
      text.includes(
        "ts.createSemanticDiagnosticsBuilderProgram = createSemanticDiagnosticsBuilderProgram;"
      )
    )
    .removeSubmodule((text) =>
      text.includes("ts.createResolutionCache = createResolutionCache;")
    )
    .removeSubmodule((text) =>
      text.includes("ts.createWatchCompilerHost = createWatchCompilerHost;")
    )
    .removeSubmodule((text) =>
      text.includes(
        "ts.resolveConfigFileProjectName = resolveConfigFileProjectName;"
      )
    )
    .removeSubmodule((text) =>
      text.includes("ts.getBuildInfo = getBuildInfo;")
    );

  // Compile
  source
    .removeSubmodule((text) =>
      text.includes("ts.createCompilerHost = createCompilerHost;")
    )
    .removeSubmodule((text) => text.includes("(ts.BuilderState = {})"))
    .removeSubmodule((text) => text.includes("ts.transpile = transpile;"));

  // Watch
  source.removeSubmodule((text) =>
    text.includes("ts.getWatchFactory = getWatchFactory;")
  );

  // `ts.canProduceDiagnostics`, `ts.createGetSymbolAccessibilityDiagnosticForNode`, and `ts.createGetSymbolAccessibilityDiagnosticForNode`
  source.removeSubmodule((text) =>
    text.includes("ts.canProduceDiagnostics = canProduceDiagnostics;")
  );

  // `ts.moduleSpecifiers`
  source.removeSubmodule((text) => text.includes("(ts.moduleSpecifiers = {})"));

  // `ts.trace`
  source.removeSubmodule((text) => text.includes("ts.trace = trace;"));

  // `ts.createTypeChecker`
  source.removeSubmodule((text) =>
    text.includes("ts.createTypeChecker = createTypeChecker;")
  );

  // `ts.DocumentHighlights`
  source.removeSubmodule((text) =>
    text.includes("(ts.DocumentHighlights = {})")
  );

  // `ts.createDocumentRegistry`
  source.removeSubmodule((text) =>
    text.includes("ts.createDocumentRegistry = createDocumentRegistry;")
  );

  // `ts.CallHierarchy`
  source.removeSubmodule((text) => text.includes("(ts.CallHierarchy = {})"));

  // `ts.flattenDestructuringAssignment` and `ts.flattenDestructuringBinding`
  source.removeSubmodule(
    (text) =>
      text.includes(
        "ts.flattenDestructuringAssignment = flattenDestructuringAssignment"
      ) &&
      text.includes(
        "ts.flattenDestructuringBinding = flattenDestructuringBinding"
      )
  );

  // `ts.processTaggedTemplateExpression`
  source.removeSubmodule((text) =>
    text.includes(
      "ts.processTaggedTemplateExpression = processTaggedTemplateExpression"
    )
  );

  // Editor
  source
    .removeSubmodule((text) =>
      text.includes("ts.getEditsForFileRename = getEditsForFileRename;")
    )
    .removeSubmodule((text) => text.includes("(ts.GoToDefinition = {})"))
    .removeSubmodule((text) => text.includes("(ts.JsDoc = {})"))
    .removeSubmodule((text) => text.includes("(ts.NavigateTo = {})"))
    .removeSubmodule((text) => text.includes("(ts.NavigationBar = {})"))
    .removeSubmodule((text) => text.includes("(ts.OrganizeImports = {})"))
    .removeSubmodule((text) =>
      text.includes("(ts.OutliningElementsCollector = {})")
    )
    .removeSubmodule((text) =>
      text.includes("ts.createPatternMatcher = createPatternMatcher;")
    )
    .removeSubmodule((text) => text.includes("(ts.SymbolDisplay = {})"));

  // `ts.refactor` (multiple)
  source.removeMultipleSubmodules((text) =>
    text.trimStart().startsWith("var refactor;")
  );

  // `ts.codefix` (multiple)
  source.removeMultipleSubmodules((text) =>
    text.trimStart().startsWith("var codefix;")
  );

  // `ts.formatting` (multiple)
  source.removeMultipleSubmodules((text) =>
    text.trimStart().startsWith("var formatting;")
  );

  // `ts.Completions` (multiple)
  source.removeMultipleSubmodules((text) =>
    text.trimStart().startsWith("var Completions;")
  );

  // `ts.FindAllReferences` (multiple)
  source.removeMultipleSubmodules((text) =>
    text.trimStart().startsWith("var FindAllReferences;")
  );

  // Performance
  source.replaceSubmodule(
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
    source.replaceAll(find, replacement);
  }

  source.replaceAlignedCode({
    start: "var debugObjectHost = (function () {",
    end: "})();",
  });

  return source.toString();
}

// Save modified code to `{PROJECT_ROOT}/.tmp/modified-typescript.js` for debug
const saveOutputToDisk = (process) => (text) => {
  const result = process(text);
  writeFile(path.join(PROJECT_ROOT, ".tmp/modified-typescript.js"), result);
  return result;
};

export default saveOutputToDisk(modifyTypescriptModule);
