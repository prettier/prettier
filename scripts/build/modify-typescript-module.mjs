import path from "node:path";
import escapeStringRegexp from "escape-string-regexp";
import { outdent } from "outdent";
import MagicString from "magic-string";
import { writeFile, PROJECT_ROOT } from "../utils/index.mjs";

function* getSubmodules(text) {
  const parts = text.split(/(?<=\n)( {2}\/\/ src\/\S+\n)/);

  let start = parts[0].length;

  for (let partIndex = 1; partIndex < parts.length - 1; partIndex += 2) {
    const comment = parts[partIndex];
    const code = parts[partIndex + 1];

    const path = comment.slice("  // ".length, -1);
    const end = start + comment.length + code.length;

    if (/\S/.test(code)) {
      yield {
        isEntry: path === "src/typescript/typescript.ts",
        path,
        start: start + comment.length,
        end: end - 1,
        code,
      };
    }

    start = end;
  }
}

class TypeScriptModuleSource {
  #source;
  modules;

  constructor(text) {
    this.#source = new MagicString(text);
    this.modules = [...getSubmodules(text)];
  }

  replaceModule(module, replacement) {
    if (typeof module === "string") {
      module = this.modules.find((searching) => searching.path === module);
    }

    if (!module) {
      throw Object.assign(new Error("Module not found"), { module });
    }

    this.#source.overwrite(module.start, module.end, replacement);
    return this;
  }

  removeModule(module) {
    return this.replaceModule(module, "");
  }

  removeSubmodule(testFunction) {
    return this.replaceSubmodule(testFunction, "");
  }

  replaceSubmodules(testFunction, replacement = "") {
    const modules = this.modules.filter((module) => testFunction(module));

    for (const { start, end } of modules) {
      this.#source.overwrite(start, end, replacement);
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

  prepend(...args) {
    this.#source.prepend(...args);
    return this;
  }

  append(...args) {
    this.#source.append(...args);
    return this;
  }

  replace(...args) {
    this.#source.replace(...args);
    return this;
  }

  replaceAll(...args) {
    this.#source.replaceAll(...args);
    return this;
  }

  applyChanges() {
    const text = this.#source.toString();
    this.#source = new MagicString(text);
    this.modules = getSubmodules(text);
  }

  toString() {
    return this.#source.toString();
  }
}

function unwrap(text) {
  const startMark = "var ts = (() => {";
  const endMark = "return __toCommonJS(typescript_exports);";
  const start = text.indexOf(startMark);
  const end = text.lastIndexOf(endMark);

  if (start === -1 || end === -1) {
    throw new Error("Unexpected source");
  }

  return text.slice(start + startMark.length, end);
}

function modifyTypescriptModule(text) {
  text = unwrap(text);
  const source = new TypeScriptModuleSource(text);

  // Deprecated
  for (const module of source.modules) {
    if (module.path.startsWith("src/deprecatedCompat/")) {
      source.removeModule(module);
    }
  }

  // `codefixes`
  source.removeModule("src/services/_namespaces/ts.codefix.ts");
  source.removeModule("src/services/codeFixProvider.ts");
  for (const module of source.modules) {
    if (module.path.startsWith("src/services/codefixes/")) {
      source.removeModule(module);
    }
  }

  // `ts.refactor`
  source.removeModule("src/services/_namespaces/ts.refactor.ts");
  source.removeModule("src/services/refactorProvider.ts");
  for (const module of source.modules) {
    if (module.path.startsWith("src/services/_namespaces/ts.refactor.")) {
      source.removeModule(module);
    }
  }
  for (const module of source.modules) {
    if (module.path.startsWith("src/services/refactors/")) {
      source.removeModule(module);
    }
  }

  // `transformers`
  source.removeModule("src/services/transform.ts");
  source.removeModule("src/compiler/transformer.ts");
  for (const module of source.modules) {
    if (
      module.path.startsWith("src/services/transformers/")
      || module.path.startsWith("src/compiler/transformers/")
    ) {
      source.removeModule(module);
    }
  }

  // `formatting`
  source.removeModule("src/services/_namespaces/ts.formatting.ts");
  for (const module of source.modules) {
    if (module.path.startsWith("src/services/formatting/")) {
      source.removeModule(module);
    }
  }

  // `ts.moduleSpecifiers`
  source.removeModule("src/compiler/_namespaces/ts.moduleSpecifiers.ts");
  source.removeModule("src/compiler/moduleSpecifiers.ts");

  // `ts.SmartSelectionRange`
  source.removeModule("src/services/_namespaces/ts.SmartSelectionRange.ts");
  source.removeModule("src/services/smartSelection.ts");

  // `ts.SymbolDisplay`
  source.removeModule("src/services/_namespaces/ts.SymbolDisplay.ts");
  source.removeModule("src/services/symbolDisplay.ts");

  // `ts.textChanges`
  source.removeModule("src/services/_namespaces/ts.textChanges.ts");
  source.removeModule("src/services/textChanges.ts");

  // `ts.SignatureHelp`
  source.removeModule("src/services/_namespaces/ts.SignatureHelp.ts");
  source.removeModule("src/services/signatureHelp.ts");

  //
  source.removeModule("src/services/exportInfoMap.ts");

  // Suggestion
  source.removeModule("src/services/suggestionDiagnostics.ts");

  // classifier
  source.removeModule("src/services/classifier.ts");
  source.removeModule("src/services/classifier2020.ts");
  for (const module of source.modules) {
    if (module.path.startsWith("src/services/_namespaces/ts.classifier.")) {
      source.removeModule(module);
    }
  }

  // Sourcemap
  source.removeModule("src/services/sourcemaps.ts");
  source.removeModule("src/compiler/sourcemap.ts");

  // jsTyping
  for (const module of source.modules) {
    if (module.path.startsWith("src/jsTyping/")) {
      source.removeModule(module);
    }
  }

  // `ts.Completions`
  source.removeModule("src/services/_namespaces/ts.Completions.ts");
  source.removeModule("src/services/completions.ts");
  source.removeModule(
    "src/services/_namespaces/ts.Completions.StringCompletions.ts"
  );
  source.removeModule("src/services/stringCompletions.ts");

  // `ts.GoToDefinition`
  source.removeModule("src/services/_namespaces/ts.GoToDefinition.ts");
  source.removeModule("src/services/goToDefinition.ts");

  // `ts.JsDoc`
  source.removeModule("src/services/_namespaces/ts.JsDoc.ts");
  source.removeModule("src/services/jsDoc.ts");

  // `ts.OrganizeImports`
  source.removeModule("src/services/_namespaces/ts.OrganizeImports.ts");
  source.removeModule("src/services/organizeImports.ts");

  // `ts.OutliningElementsCollector`
  source.removeModule(
    "src/services/_namespaces/ts.OutliningElementsCollector.ts"
  );
  source.removeModule("src/services/outliningElementsCollector.ts");

  // `ts.NavigationBar`
  source.removeModule("src/services/_namespaces/ts.NavigationBar.ts");
  source.removeModule("src/services/navigationBar.ts");

  // `ts.NavigateTo`
  source.removeModule("src/services/_namespaces/ts.NavigateTo.ts");
  source.removeModule("src/services/navigateTo.ts");

  // `ts.BreakpointResolver`
  source.removeModule("src/services/_namespaces/ts.BreakpointResolver.ts");
  source.removeModule("src/services/breakpoints.ts");

  // `ts.Rename`
  source.removeModule("src/services/_namespaces/ts.Rename.ts");
  source.removeModule("src/services/rename.ts");

  // `ts.InlayHints`
  source.removeModule("src/services/_namespaces/ts.InlayHints.ts");
  source.removeModule("src/services/inlayHints.ts");

  // `ts.CallHierarchy`
  source.removeModule("src/services/_namespaces/ts.CallHierarchy.ts");
  source.removeModule("src/services/callHierarchy.ts");

  // `ts.FindAllReferences`
  source.removeModule("src/services/_namespaces/ts.FindAllReferences.ts");
  source.removeModule("src/services/findAllReferences.ts");

  // watch
  source.removeModule("src/compiler/watch.ts");
  source.removeModule("src/compiler/watchPublic.ts");
  source.removeModule("src/compiler/watchUtilities.ts");

  // build
  source.removeModule("src/compiler/commandLineParser.ts");
  source.removeModule("src/compiler/builder.ts");
  source.removeModule("src/compiler/builderPublic.ts");
  source.removeModule("src/compiler/resolutionCache.ts");
  source.removeModule("src/compiler/tsbuild.ts");
  source.removeModule("src/compiler/tsbuildPublic.ts");

  // Misc
  source.removeModule("src/services/types.ts");
  source.removeModule("src/services/preProcess.ts");
  source.removeModule("src/services/documentHighlights.ts");
  source.removeModule("src/services/documentRegistry.ts");
  source.removeModule("src/services/patternMatcher.ts");
  source.removeModule("src/services/getEditsForFileRename.ts");
  source.removeModule("src/services/shims.ts");
  source.removeModule("src/services/importTracker.ts");
  source.removeModule("src/services/transpile.ts");

  source.removeModule("src/compiler/symbolWalker.ts");
  source.removeModule("src/compiler/binder.ts");
  source.removeModule("src/compiler/semver.ts");
  source.removeModule("src/compiler/program.ts");
  source.removeModule("src/compiler/moduleNameResolver.ts");
  source.removeModule("src/compiler/checker.ts");
  source.removeModule("src/compiler/visitorPublic.ts");

  // File system
  source.replaceModule("src/compiler/sys.ts", "var sys");
  source.replaceModule("src/compiler/tracing.ts", "var tracing")
  // perfLogger
  source.replaceModule(
    "src/compiler/perfLogger.ts",
    "var perfLogger = new Proxy(() => {}, {get: () => perfLogger});"
  );

  // performanceCore
  source.replaceModule(
    "src/compiler/performanceCore.ts",
    `
    var tryGetNativePerformanceHooks = () => {};
    var timestamp = Date.now;
  `
  );


  // `factory`
  source.removeModule("src/compiler/factory/emitNode.ts");
  source.removeModule("src/compiler/factory/emitHelpers.ts");
  source.replaceModule("src/compiler/factory/nodeConverters.ts", `
    var createNodeConverters = () => new Proxy({}, {get: () => () => {}})
  `)

  source.prepend("var require;");
  source.append("module.exports = __toCommonJS(typescript_exports);");
  // source
  //   .replaceAlignedCode({
  //     start: "function createParenthesizerRules(",
  //     end: "}",
  //   })
  //   .replace(
  //     "ts.createParenthesizerRules = createParenthesizerRules;",
  //     "ts.createParenthesizerRules = () => ts.nullParenthesizerRules;"
  //   );

  source.applyChanges();
  for (const module of source.modules) {
    console.log(module.path);
  }

  return source.toString();

  // `ts.scanner`
  // This is a big module, most code except `ts.scanner` is not used
  source.replaceSubmodule(
    (text) => text.includes("ts.findPackageJson = findPackageJson;"),
    "ts.scanner = ts.createScanner(99 /* ScriptTarget.Latest */, /*skipTrivia*/ true);"
  );

  /* spell-checker: disable */
  // `ts.createParenthesizerRules`
  source
    .replaceAlignedCode({
      start: "function createParenthesizerRules(",
      end: "}",
    })
    .replace(
      "ts.createParenthesizerRules = createParenthesizerRules;",
      "ts.createParenthesizerRules = () => ts.nullParenthesizerRules;"
    );
  /* spell-checker: enable */

  // `ts.getScriptTargetFeatures`
  source
    .replaceAlignedCode({
      start: "function getScriptTargetFeatures(",
      end: "}",
    })
    .replace("ts.getScriptTargetFeatures = getScriptTargetFeatures;", "");

  // Compile

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

  // `ts.refactor` (multiple)
  source.removeMultipleSubmodules((text) =>
    text.trimStart().startsWith("var refactor;")
  );

  // `ts.FindAllReferences` (multiple)
  source.removeMultipleSubmodules((text) =>
    text.trimStart().startsWith("var FindAllReferences;")
  );

  for (const [find, replacement] of Object.entries({
    // yarn pnp
    "process.versions.pnp": "undefined",

    // Dynamic `require()`s
    "ts.sys && ts.sys.require": "false",
  })) {
    source.replaceAll(find, replacement);
  }
}

// Save modified code to `{PROJECT_ROOT}/.tmp/modified-typescript.js` for debug
const saveOutputToDisk = (process) => (text) => {
  const result = process(text);
  writeFile(path.join(PROJECT_ROOT, ".tmp/modified-typescript.js"), result);
  return result;
};

export default saveOutputToDisk(modifyTypescriptModule);
