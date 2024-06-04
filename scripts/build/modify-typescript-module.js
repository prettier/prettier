import path from "node:path";

import escapeStringRegexp from "escape-string-regexp";
import MagicString from "magic-string";
import { outdent } from "outdent";

import { PROJECT_ROOT, writeFile } from "../utils/index.js";

function* getModules(text) {
  const parts = text.split(/(?<=\n)( {2}\/\/ src\/\S+\n)/);

  let start = parts[0].length;

  for (let partIndex = 1; partIndex < parts.length - 1; partIndex += 2) {
    const comment = parts[partIndex];
    const code = parts[partIndex + 1];

    const path = comment.slice("  // ".length, -1);
    const end = start + comment.length + code.length;

    if (/\S/.test(code)) {
      const esmRegExp = new RegExp(
        [
          String.raw`\s*var (?<initFunctionName>\w+) = __esm\({`,
          `\\s*"${escapeStringRegexp(path)}"\\(\\) {`,
          ".*",
          String.raw`\s*}`,
          String.raw`\s*}\);`,
        ].join(String.raw`\n`),
        "s",
      );
      const match = code.match(esmRegExp);

      yield {
        isEntry: path === "src/typescript/typescript.ts",
        path,
        start: start + comment.length,
        end: end - 1,
        code,
        esmModuleInitFunctionName: match?.groups.initFunctionName,
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
    this.modules = [...getModules(text)];
  }

  replaceModule(module, replacement) {
    if (typeof module === "string") {
      const found = this.modules.find((searching) => searching.path === module);

      if (!found) {
        throw new Error(`Module '${module}' not found`);
      }

      module = found;
    }

    const { esmModuleInitFunctionName } = module;
    const moduleInitCode = esmModuleInitFunctionName
      ? `var ${esmModuleInitFunctionName} = () => {};`
      : "";

    this.#source.overwrite(
      module.start,
      module.end,
      moduleInitCode + replacement,
    );
    return this;
  }

  removeModule(module) {
    return this.replaceModule(module, "");
  }

  hasModule(module) {
    return this.modules.some((searching) => searching.path === module);
  }

  replaceAlignedCode({ start, end, replacement = "" }) {
    const regexp = new RegExp(
      [
        "(?<=\n)",
        String.raw`(?<indentString>\s*)`,
        escapeStringRegexp(start),
        ".*?",
        "(?<=\n)",
        String.raw`\k<indentString>`,
        escapeStringRegexp(end),
        "(?=\n)",
      ].join(""),
      "gsu",
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
    this.modules = getModules(text);
  }

  toString() {
    return this.#source.toString();
  }
}

function unwrap(text) {
  const startMark = "var ts = (() => {";
  const endMark = "return require_typescript();";
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

  // jsTyping
  for (const module of source.modules) {
    if (module.path.startsWith("src/jsTyping/")) {
      source.removeModule(module);
    }
  }

  // services
  for (const module of source.modules) {
    if (
      module.path === "src/services/services.ts" ||
      module.path === "src/services/_namespaces/ts.ts"
    ) {
      continue;
    }

    // This is a big module, most code except `scanner` is not used
    if (module.path === "src/services/utilities.ts") {
      source.replaceModule(
        module,
        outdent`
          var scanner;
          var ${module.esmModuleInitFunctionName} = () => {
            init_debug();
            scanner = createScanner(99 /* Latest */, /*skipTrivia*/ true);
          };
        `,
      );
      continue;
    }

    if (module.path.startsWith("src/services/")) {
      source.removeModule(module);
    }
  }

  // server
  for (const module of source.modules) {
    if (module.path.startsWith("src/server/")) {
      source.removeModule(module);
    }
  }

  // `transformers`
  source.removeModule("src/compiler/transformer.ts");
  for (const module of source.modules) {
    if (module.path.startsWith("src/compiler/transformers/")) {
      source.removeModule(module);
    }
  }

  // `ts.moduleSpecifiers`
  source.removeModule("src/compiler/_namespaces/ts.moduleSpecifiers.ts");
  source.removeModule("src/compiler/moduleSpecifiers.ts");

  // Sourcemap
  source.removeModule("src/compiler/sourcemap.ts");

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
  source.removeModule("src/compiler/builderState.ts");
  source.removeModule("src/compiler/builderStatePublic.ts");

  // Misc
  source.removeModule("src/compiler/symbolWalker.ts");
  source.removeModule("src/compiler/binder.ts");
  source.removeModule("src/compiler/semver.ts");
  source.removeModule("src/compiler/program.ts");
  source.removeModule("src/compiler/moduleNameResolver.ts");
  source.removeModule("src/compiler/checker.ts");
  source.removeModule("src/compiler/visitorPublic.ts");
  source.removeModule("src/compiler/emitter.ts");
  source.removeModule("src/compiler/_namespaces/ts.performance.ts");

  // File system
  source.replaceModule("src/compiler/sys.ts", "var sys;");
  source.replaceModule("src/compiler/tracing.ts", "var tracing;");

  // perfLogger
  source.replaceModule(
    "src/compiler/perfLogger.ts",
    "var perfLogger = new Proxy(() => {}, {get: () => perfLogger});",
  );

  // performanceCore
  source.replaceModule(
    "src/compiler/performanceCore.ts",
    outdent`
      var tryGetNativePerformanceHooks = () => {};
      var timestamp = Date.now;
    `,
  );

  // `factory`
  source.removeModule("src/compiler/factory/emitNode.ts");
  source.removeModule("src/compiler/factory/emitHelpers.ts");
  source.replaceModule(
    "src/compiler/factory/nodeConverters.ts",
    outdent`
      var createNodeConverters = () => new Proxy({}, {get: () => () => {}});
    `,
  );

  // `pnp`
  if (source.hasModule("src/compiler/pnp.ts")) {
    source.removeModule("src/compiler/pnp.ts");
  }

  /* spell-checker: disable */
  // `ts.createParenthesizerRules`
  source.replaceAlignedCode({
    start: "function createParenthesizerRules(",
    end: "}",
  });
  /* spell-checker: enable */

  source.replaceAlignedCode({
    start: "function getScriptTargetFeatures(",
    end: "}",
  });

  source.replaceAlignedCode({
    start: "var __require = ",
    end: "});",
  });

  source.append("module.exports = require_typescript();");

  return source.toString();
}

// Save modified code to `{PROJECT_ROOT}/.tmp/modified-typescript.js` for debug
const saveOutputToDisk = (process) => (text) => {
  const result = process(text);
  writeFile(path.join(PROJECT_ROOT, ".tmp/modified-typescript.js"), result);
  return result;
};

export default saveOutputToDisk(modifyTypescriptModule);
