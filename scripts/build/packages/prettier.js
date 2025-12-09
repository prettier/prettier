import path from "node:path";
import url from "node:url";
import createEsmUtils from "esm-utils";
import { outdent } from "outdent";
import { DIST_DIR, PROJECT_ROOT } from "../../utilities/index.js";
import { createJavascriptModuleBuilder } from "../builders/javascript-module.js";
import esmifyTypescriptEslint from "../hacks/esmify-typescript-eslint.js";
import modifyTypescriptModule from "../hacks/modify-typescript-module.js";
import { getPackageFile } from "../utilities.js";
import {
  createNodejsFileConfig,
  createPackageMetaFilesConfig,
  createTypesConfig,
  createUniversalFileConfig,
} from "./config-helpers.js";
import { generatePackageJson } from "./prettier-package-json.js";

const {
  require,
  dirname,
  resolve: importMetaResolve,
} = createEsmUtils(import.meta);
const resolveEsmModulePath = (specifier) =>
  url.fileURLToPath(importMetaResolve(specifier));

const extensions = {
  esm: ".mjs",
  umd: ".js",
  cjs: ".cjs",
};

const packageConfig = {
  packageName: "prettier",
  sourceDirectory: PROJECT_ROOT,
  distDirectory: path.join(DIST_DIR, "prettier"),
  modules: [],
};

const mainModule = {
  name: "Main",
  files: [
    createNodejsFileConfig({
      input: "src/index.js",
      replaceModule: [
        // We don't need semver since we don't use `options.version`
        {
          module: require.resolve("editorconfig-without-wasm"),
          process(text) {
            text = text.replace("import * as semver from 'semver';", "");
            text = text.replace("semver.gte(version, '0.10.0')", "true");
            return text;
          },
        },
        {
          module: require.resolve("n-readlines"),
          process(text) {
            text = text.replace(
              "const fs = require('fs')",
              'import fs from "node:fs"',
            );
            text = text.replace("module.exports = ", "export default ");

            return text;
          },
        },
        // `parse-json` use another copy of `@babel/code-frame`
        {
          module: require.resolve("@babel/code-frame", {
            paths: [require.resolve("parse-json")],
          }),
          path: require.resolve("@babel/code-frame"),
        },
        {
          module: getPackageFile("json5/dist/index.mjs"),
          find: "export default lib;",
          replacement: "export default { parse };",
        },
      ],
      addDefaultExport: true,
      reuseDocModule: true,
      format: "esm",
    }),
    createNodejsFileConfig("src/index.cjs"),
    createUniversalFileConfig({
      input: "src/standalone.js",
      umdVariableName: "prettier",
      replaceModule: [
        {
          module: require.resolve("@babel/code-frame"),
          process(text) {
            text = text.replaceAll(
              "var picocolors = require('picocolors');",
              "",
            );
            text = text.replaceAll("var jsTokens = require('js-tokens');", "");
            text = text.replaceAll(
              "var helperValidatorIdentifier = require('@babel/helper-validator-identifier');",
              "",
            );

            text = text.replaceAll(
              /(?<=\n)let tokenize;\n\{\n.*?\n\}(?=\n)/gsu,
              "",
            );

            text = text.replaceAll(
              /(?<=\n)function highlight\(text\) \{\n.*?\n\}(?=\n)/gsu,
              "function highlight(text) {return text}",
            );

            text = text.replaceAll(
              /(?<=\n)function getDefs\(enabled\) \{\n.*?\n\}(?=\n)/gsu,
              outdent`
                function getDefs() {
                  return new Proxy({}, {get: () => (text) => text})
                }
              `,
            );

            text = text.replaceAll(
              "const defsOn = buildDefs(picocolors.createColors(true));",
              "",
            );
            text = text.replaceAll(
              "const defsOff = buildDefs(picocolors.createColors(false));",
              "",
            );

            text = text.replaceAll(
              "const shouldHighlight = opts.forceColor || isColorSupported() && opts.highlightCode;",
              "const shouldHighlight = false;",
            );

            text = text.replaceAll("exports.default = index;", "");
            text = text.replaceAll("exports.highlight = highlight;", "");

            return text;
          },
        },
        // Smaller size
        {
          module: getPackageFile("picocolors/picocolors.browser.js"),
          path: path.join(dirname, "../shims/colors.js"),
        },
      ],
    }),
  ].flat(),
};
for (const file of mainModule.files) {
  if (file.output === "standalone.mjs") {
    file.playground = true;
  }
}

const cliModule = {
  name: "CLI",
  files: [
    {
      input: "bin/prettier.cjs",
      outputBaseName: "bin/prettier",
      target: ["node0.10"],
      replaceModule: [
        {
          module: path.join(PROJECT_ROOT, "bin/prettier.cjs"),
          process(text) {
            text = text.replace(
              "../src/cli/index.js",
              "../internal/legacy-cli.mjs",
            );
            text = text.replace(
              "../src/experimental-cli/index.js",
              "../internal/experimental-cli.mjs",
            );
            return text;
          },
        },
      ],
    },
    {
      input: "src/cli/index.js",
      outputBaseName: "internal/legacy-cli",
      external: ["tinybench"],
      // TODO: Remove this when we drop support for Node.js v16
      replaceModule: [
        {
          module: resolveEsmModulePath("@cacheable/memory"),
          process: (text) =>
            outdent`
              const structuredClone =
                globalThis.structuredClone ??
                ((value) => JSON.parse(JSON.stringify(value)));

              ${text}
            `,
        },
      ],
    },
    ...[
      {
        input: "src/experimental-cli/index.js",
        outputBaseName: "internal/experimental-cli",
        replaceModule: [
          {
            module: getPackageFile("@prettier/cli/dist/prettier_serial.js"),
            external: "./experimental-cli-worker.mjs",
          },
          {
            module: getPackageFile("@prettier/cli/dist/prettier_parallel.js"),
            find: 'new URL("./prettier_serial.js", import.meta.url)',
            replacement:
              'new URL("./experimental-cli-worker.mjs", import.meta.url)',
          },
          {
            module: getPackageFile("json5/dist/index.mjs"),
            find: "export default lib;",
            replacement: "export default { parse };",
          },
          {
            module: getPackageFile("js-yaml/dist/js-yaml.mjs"),
            find: "var dump                = dumper.dump;",
            replacement: "var dump;",
          },
        ],
      },
      {
        input: "src/experimental-cli/worker.js",
        outputBaseName: "internal/experimental-cli-worker",
      },
    ].map(({ input, outputBaseName, replaceModule = [] }) => ({
      input,
      outputBaseName,
      replaceModule: [
        ...replaceModule,
        {
          module: getPackageFile("@prettier/cli/dist/constants.js"),
          path: path.join(
            PROJECT_ROOT,
            "src/experimental-cli/constants.evaluate.js",
          ),
        },
        ...["package.json", "index.mjs"].map((file) => ({
          module: getPackageFile(`prettier/${file}`),
          external: `../${file}`,
        })),
      ],
    })),
  ].flatMap((file) => createNodejsFileConfig(file)),
};

const docModule = {
  name: "Doc",
  files: [
    createUniversalFileConfig({
      input: "src/document/public.js",
      outputBaseName: "doc",
      umdVariableName: "doc",
      minify: false,
    }),
  ].flat(),
};

const pluginFiles = [
  "src/plugins/estree.js",
  {
    input: "src/plugins/babel.js",
    replaceModule: [
      {
        // We don't use value of JSXText
        module: require.resolve("@babel/parser"),
        process: (text) =>
          text.replaceAll(
            /const entity\s?=\s?entities\[desc\];/gu,
            "const entity = undefined;",
          ),
      },
    ],
  },
  {
    input: "src/plugins/flow.js",
    replaceModule: [
      {
        module: require.resolve("flow-parser"),
        process(text) {
          const { fsModuleNameVariableName } = text.match(
            /,(?<fsModuleNameVariableName>[\p{ID_Start}_$][\p{ID_Continue}$]*)="fs",/u,
          ).groups;

          return text
            .replaceAll(`require(${fsModuleNameVariableName})`, "{}")
            .replaceAll('require("fs")', "{}")
            .replaceAll('require("constants")', "{}");
        },
      },
    ],
  },
  {
    input: "src/plugins/typescript.js",
    replaceModule: [
      {
        module: require.resolve("typescript"),
        process: modifyTypescriptModule,
      },
      {
        module: getPackageFile("@typescript-eslint/typescript-estree"),
        path: getPackageFile(
          "@typescript-eslint/typescript-estree/dist/parser.js",
        ),
      },
      {
        module: getPackageFile(
          "@typescript-eslint/typescript-estree/dist/create-program/getScriptKind.js",
        ),
        process: (text) =>
          text
            .replace(
              'require("path")',
              '{extname: file => "." + file.split(".").pop()}',
            )
            .replace(
              'require("node:path")',
              '{extname: file => "." + file.split(".").pop()}',
            ),
      },
      {
        module: getPackageFile(
          "@typescript-eslint/typescript-estree/dist/parseSettings/candidateTSConfigRootDirs.js",
        ),
        process(text) {
          return text.replace(
            "process.cwd()",
            JSON.stringify("/prettier-security-dirname-placeholder"),
          );
        },
      },
      {
        module: getPackageFile(
          "@typescript-eslint/typescript-estree/dist/parseSettings/createParseSettings.js",
        ),
        process(text) {
          return text
            .replace(
              "parseSettings.projects = ",
              "parseSettings.projects = true ? new Map() : ",
            )
            .replace(
              'require("node:path")',
              '{extname: file => "." + file.split(".").pop()}',
            )
            .replace('require("@typescript-eslint/project-service")', "{}")
            .replace(
              "const tsconfigRootDir =",
              "const tsconfigRootDir = undefined && ",
            );
        },
      },
      {
        module: "*",
        process: esmifyTypescriptEslint,
      },
      {
        module: "*",
        process(text, file) {
          if (/require\(["'](?:typescript|ts-api-utils)["']\)/u.test(text)) {
            throw new Error(`Unexpected \`require("typescript")\` in ${file}.`);
          }

          return text;
        },
      },
      ...[
        {
          file: "@typescript-eslint/typescript-estree/dist/parseSettings/inferSingleRun.js",
          text: "export const inferSingleRun = () => false;",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/parseSettings/ExpiringCache.js",
          text: outdent`
            export const DEFAULT_TSCONFIG_CACHE_DURATION_SECONDS = undefined;
            export const ExpiringCache = class {};
          `,
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/parseSettings/getProjectConfigFiles.js",
          text: "export const resolveProjectList = () => [];",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/parseSettings/resolveProjectList.js",
          text: "export const resolveProjectList = () => [];",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/parseSettings/warnAboutTSVersion.js",
          text: "export const warnAboutTSVersion = () => {};",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/version-check.js",
          text: "export const typescriptVersionIsAtLeast = new Proxy({}, {get: () => true})",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/jsx/xhtml-entities.js",
          text: "export const xhtmlEntities = {};",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/simple-traverse.js",
          text: "export const simpleTraverse = () => {};",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/create-program/shared.js",
          text: "export const ensureAbsolutePath = path => path;",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/create-program/createIsolatedProgram.js",
          text: "export const createIsolatedProgram = () => {};",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/create-program/useProvidedPrograms.js",
          text: outdent`
            export const useProvidedPrograms = () => {};
            export const createProgramFromConfigFile = () => {};
          `,
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/create-program/validateDefaultProjectForFilesGlob.js",
          text: "export const validateDefaultProjectForFilesGlob = () => {};",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/create-program/getWatchProgramsForProjects.js",
          text: "export const getWatchProgramsForProjects = () => {};",
        },
        "@typescript-eslint/typescript-estree/dist/create-program/describeFilePath.js",
        {
          file: "@typescript-eslint/typescript-estree/dist/create-program/createProjectProgram.js",
          text: "export const createProjectProgram = () => {};",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/useProgramFromProjectService.js",
          text: "export const useProgramFromProjectService = () => {};",
        },
        {
          file: "@typescript-eslint/typescript-estree/dist/semantic-or-syntactic-errors.js",
          text: "export const getFirstSemanticOrSyntacticError = () => {};",
        },
      ].map((options) => {
        options = typeof options === "string" ? { file: options } : options;
        return {
          module: getPackageFile(options.file),
          text: options.text || "export {};",
        };
      }),

      // Only needed if `range`/`loc` in parse options is `false`
      {
        module: getPackageFile("debug/src/browser.js"),
        path: path.join(dirname, "../shims/debug.js"),
      },
      {
        module: require.resolve("ts-api-utils"),
        process() {
          throw new Error(
            "Please replace the CJS version of 'ts-api-utils' with ESM version.",
          );
        },
      },
      {
        module: getPackageFile(
          "@typescript-eslint/types/dist/generated/ast-spec.js",
          "@typescript-eslint/typescript-estree",
        ),
        text: outdent`
          const TYPE_STORE = new Proxy({}, {get: (_, type) => type});
          export { TYPE_STORE as AST_TOKEN_TYPES, TYPE_STORE as AST_NODE_TYPES};
        `,
      },
      // Use named import from `typescript`
      {
        module: getPackageFile("ts-api-utils/lib/index.js"),
        process(text) {
          const typescriptVariables = [
            ...text.matchAll(
              /import (?<variable>\w+) from ["']typescript["']/gu,
            ),
          ].map((match) => match.groups.variable);

          // Remove `'property' in typescript` check
          text = text.replaceAll(
            new RegExp(
              String.raw`".*?" in (?:${typescriptVariables.join("|")})(?=\W)`,
              "gu",
            ),
            "true",
          );

          text = text.replaceAll(
            /(?<=import )(?=\w+ from ["']typescript["'])/gu,
            "* as ",
          );

          return text;
        },
      },
    ],
  },
  {
    input: "src/plugins/acorn.js",
    replaceModule: [
      {
        module: resolveEsmModulePath("espree"),
        process(text) {
          const lines = text.split("\n");

          let lineIndex;

          // Remove `eslint-visitor-keys`
          lineIndex = lines.findIndex((line) =>
            line.endsWith(' from "eslint-visitor-keys";'),
          );
          lines.splice(lineIndex, 1);

          // Remove code after `// Public`
          lineIndex = lines.indexOf("// Public") - 1;
          lines.length = lineIndex;

          // Save code after `// Parser`
          lineIndex = lines.indexOf("// Parser") - 1;
          const parserCodeLines = lines.slice(lineIndex);
          lines.length = lineIndex;

          // Remove code after `// Tokenizer`
          lineIndex = lines.indexOf("// Tokenizer") - 1;
          lines.length = lineIndex;

          text = [...lines, ...parserCodeLines].join("\n");

          return text;
        },
      },
      {
        // We don't use value of JSXText
        module: getPackageFile("acorn-jsx/xhtml.js"),
        text: "module.exports = {};",
      },
      {
        module: getPackageFile("acorn-jsx/index.js"),
        find: 'require("acorn")',
        replacement: "undefined",
      },
    ],
  },
  {
    input: "src/plugins/meriyah.js",
    replaceModule: [
      // We don't use value of JSXText
      {
        module: resolveEsmModulePath("meriyah"),
        find: "parser.tokenValue = decodeHTMLStrict(raw);",
        replacement: "parser.tokenValue = raw;",
      },
    ],
  },
  {
    input: "src/plugins/angular.js",
    replaceModule: [
      {
        module: resolveEsmModulePath("@angular/compiler"),
        process(text) {
          text = text.replace(
            "const phases = [",
            "const phases = undefined && [",
          );
          text = text.replace("publishFacade(_global)", "");
          text = text.replace(
            "const serializerVisitor = new GetMsgSerializerVisitor()",
            "",
          );
          text = text.replace(
            "const compatibilityMode = CompatibilityMode.TemplateDefinitionBuilder",
            "",
          );
          text = text.replace(
            "const domSchema = new DomElementSchemaRegistry()",
            "",
          );
          text = text.replace(
            "const elementRegistry = new DomElementSchemaRegistry()",
            "",
          );
          text = text.replace(
            "const serializerVisitor$1 = new _SerializerVisitor()",
            "",
          );
          text = text.replace(
            "const NON_BINDABLE_VISITOR = new NonBindableVisitor()",
            "",
          );
          text = text.replace(
            "const NULL_EXPR = new LiteralExpr(null, null, null)",
            "",
          );
          text = text.replace(
            "const TYPED_NULL_EXPR = new LiteralExpr(null, INFERRED_TYPE, null)",
            "",
          );
          text = text.replace("const _visitor = new _Visitor$2()", "");
          text = text.replaceAll(
            /const (.*?) = new BuiltinType\(BuiltinTypeName\..*?\);/gu,
            "const $1 = undefined;",
          );
          text = text.replaceAll(/var output_ast =.*?;\n/gsu, "var output_ast");

          text = text.replace(
            "const serializer = new IcuSerializerVisitor();",
            "",
          );
          text = text.replace(
            "const _TAG_DEFINITION = new XmlTagDefinition();",
            "",
          );

          text = text.replaceAll(
            /function transformExpressionsInExpression\(.*?\n.*?\n\}\n/gsu,
            "function transformExpressionsInExpression(){}",
          );

          text = text.replaceAll(
            /const deferTriggerToR3TriggerInstructionsMap = new Map\(\[\n.*?\n\]\);\n/gsu,
            "const deferTriggerToR3TriggerInstructionsMap = undefined;",
          );

          text = text.replaceAll(
            /const BINARY_OPERATORS = new Map\(\[\n.*?\n\]\);\n/gsu,
            "const BINARY_OPERATORS = undefined;",
          );

          text = text.replaceAll(
            /const PIPE_BINDINGS = \[\n.*?\n\];\n/gsu,
            "const PIPE_BINDINGS = undefined;",
          );

          text = text.replaceAll(
            /const TEXT_INTERPOLATE_CONFIG = \{\n.*?\n\};\n/gsu,
            "const TEXT_INTERPOLATE_CONFIG = undefined;",
          );

          text = text.replaceAll(
            /const CHAINABLE = new Set\(\[\n.*?\n\]\);\n/gsu,
            "const CHAINABLE = undefined;",
          );

          text = text.replaceAll(
            /const PROPERTY_INTERPOLATE_CONFIG = \{\n.*?\n\};\n/gsu,
            "const PROPERTY_INTERPOLATE_CONFIG = undefined;",
          );
          text = text.replaceAll(
            /const STYLE_PROP_INTERPOLATE_CONFIG = \{\n.*?\n\};\n/gsu,
            "const STYLE_PROP_INTERPOLATE_CONFIG = undefined;",
          );

          text = text.replaceAll(
            /const ATTRIBUTE_INTERPOLATE_CONFIG = \{\n.*?\n\};\n/gsu,
            "const ATTRIBUTE_INTERPOLATE_CONFIG = undefined;",
          );
          text = text.replaceAll(
            /const STYLE_MAP_INTERPOLATE_CONFIG = \{\n.*?\n\};\n/gsu,
            "const STYLE_MAP_INTERPOLATE_CONFIG = undefined;",
          );
          text = text.replaceAll(
            /const CLASS_MAP_INTERPOLATE_CONFIG = \{\n.*?\n\};\n/gsu,
            "const CLASS_MAP_INTERPOLATE_CONFIG = undefined;",
          );
          text = text.replaceAll(
            /const PURE_FUNCTION_CONFIG = \{\n.*?\n\};\n/gsu,
            "const PURE_FUNCTION_CONFIG = undefined;",
          );
          text = text.replaceAll(
            /const NAMED_ENTITIES = \{\n.*?\n\};\n/gsu,
            "const NAMED_ENTITIES = {};",
          );

          return text;
        },
      },
    ],
  },
  {
    input: "src/plugins/postcss.js",
    replaceModule: [
      // The following two replacements prevent load `source-map` module
      {
        module: getPackageFile("postcss/lib/previous-map.js"),
        text: "module.exports = class {};",
      },
      {
        module: getPackageFile("postcss/lib/map-generator.js"),
        text: "module.exports = class { generate() {} };",
      },
      {
        module: getPackageFile("postcss/lib/input.js"),
        process: (text) =>
          text.replace("require('url')", "{}").replace("require('path')", "{}"),
      },
      // `postcss-values-parser` uses constructor.name, it will be changed by bundler
      // https://github.com/shellscape/postcss-values-parser/blob/c00f858ab8c86ce9f06fdb702e8f26376f467248/lib/parser.js#L499
      {
        module: getPackageFile("postcss-values-parser/lib/parser.js"),
        find: "node.constructor.name === 'Word'",
        replacement: "node.type === 'word'",
      },
      // Prevent `node:util`, `node:utl`, and `node:path` shim
      {
        module: getPackageFile("postcss-values-parser/lib/tokenize.js"),
        process: (text) =>
          text
            .replace("require('util')", "{}")
            .replace(
              "let message = util.format('Unclosed %s at line: %d, column: %d, token: %d', what, line, pos - offset, pos);",
              "let message = `Unclosed ${what} at line: ${line}, column: ${pos - offset}, token: ${pos}`;",
            )
            .replace(
              "let message = util.format('Syntax error at line: %d, column: %d, token: %d', line, pos - offset, pos);",
              "let message = `Syntax error at line: ${line}, column: ${pos - offset}, token: ${pos}`;",
            ),
      },
    ],
  },
  "src/plugins/graphql.js",
  {
    input: "src/plugins/markdown.js",
    replaceModule: [
      {
        module: getPackageFile("parse-entities/decode-entity.browser.js"),
        path: getPackageFile("parse-entities/decode-entity.js"),
      },
    ],
  },
  {
    input: "src/plugins/glimmer.js",
    replaceModule: [
      ...["@glimmer/util", "@glimmer/wire-format", "@glimmer/syntax"].map(
        (packageName) => ({
          module: getPackageFile(`${packageName}/dist/prod/index.js`),
          path: getPackageFile(`${packageName}/dist/dev/index.js`),
        }),
      ),
      {
        module: getPackageFile("@glimmer/syntax/dist/dev/index.js"),
        process(text) {
          text = text.replace(
            'import { DEBUG } from "@glimmer/env";',
            "const DEBUG = false;",
          );

          // This passed to plugins, our plugin don't need access to the options
          text = text.replace(/(?<=\sconst syntax = )\{.*?\n\}(?=;\n)/su, "{}");

          text = text.replaceAll(
            /\sclass \S+ extends[(\s]+node\(.*?\).*?\{(?:\n.*?\n)?\}\n/gsu,
            "\n",
          );

          text = text.replaceAll(
            /\nvar api\S* = \s*(?:\/\*#__PURE__\*\/)?\s*Object\.freeze\(\{.*?\n\}\);/gsu,
            "",
          );

          text = text.replace(
            "const ARGUMENT_RESOLUTION = ",
            "const ARGUMENT_RESOLUTION = undefined &&",
          );

          text = text.replace(
            "const HTML_RESOLUTION = ",
            "const HTML_RESOLUTION = undefined &&",
          );

          text = text.replace(
            "const LOCAL_DEBUG = ",
            "const LOCAL_DEBUG = false &&",
          );

          text = text.replace(
            /(?<=\n)export .*?;/u,
            "export { preprocess, getVoidTags, visitorKeys };",
          );

          return text;
        },
      },
      {
        module: getPackageFile("@handlebars/parser/dist/esm/index.js"),
        path: getPackageFile("@handlebars/parser/dist/esm/parse.js"),
      },
    ],
  },
  "src/plugins/html.js",
  "src/plugins/yaml.js",
];

function createPluginModule(file) {
  if (typeof file === "string") {
    file = { input: file };
  }

  const { input, ...buildOptions } = file;
  const { pluginName } = input.match(
    /\/plugins\/(?<pluginName>.*?)\.js$/u,
  ).groups;

  const umdVariableName = `prettierPlugins.${pluginName}`;

  const files = [
    {
      format: "esm",
      file: `${pluginName}${extensions.esm}`,
    },
    {
      format: "umd",
      file: `${pluginName}${extensions.umd}`,
      umdVariableName,
    },
  ].map((output) => ({
    input,
    output: `plugins/${output.file}`,
    build: createJavascriptModuleBuilder({
      platform: "universal",
      addDefaultExport: output.format === "esm",
      ...buildOptions,
      format: output.format,
      umdVariableName: output.umdVariableName,
    }),
    playground: output.format === "esm",
  }));

  return {
    name: `Plugin[${pluginName}]`,
    files: [
      ...files,
      ...createTypesConfig({
        input,
        outputBaseName: `plugins/${pluginName}`,
        isPlugin: true,
      }),
    ],
  };
}

const pluginModules = pluginFiles.map((file) => createPluginModule(file));

packageConfig.modules.push(
  mainModule,
  cliModule,
  docModule,
  ...pluginModules,
  createPackageMetaFilesConfig({
    "package.json": generatePackageJson,
    packageDisplayName: "Prettier",
  }),
);

export default packageConfig;
