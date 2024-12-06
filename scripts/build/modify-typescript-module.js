import path from "node:path";
import escapeStringRegexp from "escape-string-regexp";
import MagicString from "magic-string";
import { outdent } from "outdent";
import { PROJECT_ROOT, writeFile } from "../utils/index.js";
import UNUSED_SPECIFIERS from "./typescript-unused-specifiers.js";

function* getModules(text) {
  const parts = text.split(/(?<=\n)(\/\/ src\/\S+\n)/u);

  let start = parts[0].length;

  for (let partIndex = 1; partIndex < parts.length - 1; partIndex += 2) {
    const comment = parts[partIndex];
    const code = parts[partIndex + 1];

    const path = comment.slice("// ".length, -1);
    const end = start + comment.length + code.length;

    yield {
      isEntry: path === "src/typescript/typescript.ts",
      path,
      start: start + comment.length,
      end: end - 1,
      code,
    };

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

    this.#source.overwrite(module.start, module.end, replacement);
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
  const startMark = 'var ts = {}; ((module) => {\n"use strict";';
  const endMark = "// src/typescript/typescript.ts";
  const start = text.indexOf(startMark);
  const end = text.lastIndexOf(endMark);

  if (start === -1 || end === -1) {
    throw new Error("Unexpected source");
  }

  text = text.slice(start + startMark.length, end);

  return text;
}

function getExports(entry) {
  let lines = entry.code.trim().split("\n");

  if (
    !(
      lines[0] === "var typescript_exports = {};" &&
      lines[1] === "__export(typescript_exports, {" &&
      lines.at(-2) === "});" &&
      lines.at(-1) === "module.exports = __toCommonJS(typescript_exports);"
    )
  ) {
    throw new Error("Unexpected source");
  }

  lines = lines.slice(2, -2);

  const exports = lines
    .map((line) => {
      const match = line.match(
        /^\s*(?<specifier>.*?): \(\) => (?<variable>.*?),?$/u,
      );

      if (!match) {
        throw new Error("Unexpected source");
      }

      if (UNUSED_SPECIFIERS.has(match.groups.specifier)) {
        return;
      }

      return match.groups;
    })
    .filter(Boolean);

  return exports;
}

function modifyTypescriptModule(text) {
  text = unwrap(text);

  const source = new TypeScriptModuleSource(text);

  const entry = source.modules.find((module) => module.isEntry);
  const exports = getExports(entry);
  source.removeModule(entry);

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
    if (module.path === "src/services/services.ts") {
      continue;
    }

    // This is a big module, most code except `scanner` is not used
    if (module.path === "src/services/utilities.ts") {
      source.replaceModule(
        module,
        "var scanner = createScanner(ScriptTarget.Latest, /*skipTrivia*/ true);",
      );
      continue;
    }

    if (module.path.startsWith("src/services/")) {
      source.removeModule(module);
    }
  }

  // server
  source.removeModule("src/typescript/_namespaces/ts.server.ts");
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

  // `typingsInstaller`
  for (const module of source.modules) {
    if (module.path.startsWith("src/typingsInstallerCore/")) {
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
  source.removeModule("src/compiler/executeCommandLine.ts");
  source.removeModule("src/compiler/expressionToTypeNode.ts");

  // File system
  source.replaceModule("src/compiler/sys.ts", "var sys;");
  source.replaceModule("src/compiler/tracing.ts", "var tracing;");

  // performance
  source.replaceModule(
    "src/compiler/performanceCore.ts",
    outdent`
      var tryGetNativePerformanceHooks = () => {};
      var timestamp = Date.now;
    `,
  );
  source.replaceModule(
    "src/compiler/performance.ts",
    outdent`
      var mark = () => {};
      var measure = () => {};
    `,
  );

  // `factory`
  source.removeModule("src/compiler/factory/emitNode.ts");
  source.removeModule("src/compiler/factory/emitHelpers.ts");
  source.removeModule("src/compiler/factory/nodeConverters.ts");

  // `pnp`
  if (source.hasModule("src/compiler/pnp.ts")) {
    source.removeModule("src/compiler/pnp.ts");
  }
  if (source.hasModule("src/compiler/pnpapi.ts")) {
    source.removeModule("src/compiler/pnpapi.ts");
  }

  source.replaceAlignedCode({
    start: "function isNodeLikeSystem(",
    end: "}",
    replacement: "function isNodeLikeSystem() {return false}",
  });

  /* spell-checker: disable */
  // `ts.createParenthesizerRules`
  source.replaceAlignedCode({
    start: "function createParenthesizerRules(",
    end: "}",
  });
  /* spell-checker: enable */

  source.append(createExports(exports));

  // Used in `ts-api-utils`
  source.append(
    outdent`
      export const isUnparsedPrepend = () => false;
      export const isUnparsedTextLike = () => false;
    `,
  );

  // Used in `@typescript-eslint/typescript-estree`, but we manually removed them
  // source.append(
  //   outdent`
  //     export const createProgram = () => {};
  //     export const flattenDiagnosticMessageText = () => {};
  //     export const FileWatcherEventKind = () => {};
  //     export const createWatchCompilerHost = () => {};
  //     export const createAbstractBuilder = () => {};
  //     export const createWatchProgram = () => {};
  //     export const getParsedCommandLineOfConfigFile = () => {};
  //     export const createCompilerHost = () => {};
  //     export const formatDiagnostics = () => {};
  //   `,
  // );

  return { code: source.toString(), exports };
}

function createExports(exports) {
  return outdent`
    export {
      ${exports
        .map(({ specifier, variable }) =>
          variable === specifier ? specifier : `${variable} as ${specifier}`,
        )
        .map((line) => `  ${line},`)
        .join("\n")}
    };
  `;
}

// Save modified code to `{PROJECT_ROOT}/.tmp/modified-typescript.js` for debug
const saveOutputToDisk = (process) => (text) => {
  const { code } = process(text);
  writeFile(path.join(PROJECT_ROOT, ".tmp/modified-typescript.js"), code);
  return code;
};

export default saveOutputToDisk(modifyTypescriptModule);
export { modifyTypescriptModule };
