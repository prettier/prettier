import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import createEsmUtils from "esm-utils";
import { outdent } from "outdent";
import { copyFile, DIST_DIR, PROJECT_ROOT } from "../utils/index.js";
import buildDependenciesLicense from "./build-dependencies-license.js";
import buildJavascriptModule from "./build-javascript-module.js";
import {
  buildPluginHermesPackageJson,
  buildPluginOxcPackageJson,
  buildPrettierPackageJson,
} from "./build-package-json.js";
import buildTypes from "./build-types.js";
import esmifyTypescriptEslint from "./esmify-typescript-eslint.js";
import modifyTypescriptModule from "./modify-typescript-module.js";
import { getPackageFile } from "./utils.js";

const {
  require,
  dirname,
  resolve: importMetaResolve,
} = createEsmUtils(import.meta);
const resolveEsmModulePath = (specifier) =>
  url.fileURLToPath(importMetaResolve(specifier));
const copyFileBuilder = ({ packageConfig, file }) =>
  copyFile(
    path.join(PROJECT_ROOT, file.input),
    path.join(packageConfig.distDirectory, file.output.file),
  );

function getTypesFileConfig({ input: jsFileInput, outputBaseName, isPlugin }) {
  let input = jsFileInput;
  if (!isPlugin) {
    input = jsFileInput.replace(/\.[cm]?js$/u, ".d.ts");

    if (!fs.existsSync(path.join(PROJECT_ROOT, input))) {
      return;
    }
  }

  return {
    input,
    output: {
      file: `${outputBaseName}.d.ts`,
    },
    kind: "types",
    isPlugin,
    build: buildTypes,
  };
}

/**
 * @typedef {Object} BuildOptions
 * @property {object[]?} replaceModule - Module replacements
 * @property {string[]?} target - ESBuild targets
 * @property {string[]?} external - array of paths that should not be included in the final bundle
 * @property {boolean?} minify - disable code minification
 *
 * @typedef {Object} Output
 * @property {"esm" | "umd" | "cjs" | "text" | "json"} format - File format
 * @property {string} file - path of the output file in the `dist/` folder
 * @property {string?} umdVariableName - name for the UMD file (for plugins, it'll be `prettierPlugins.${name}`)
 *
 * @typedef {Object} File
 * @property {string} input - input of the file
 * @property {Output} output - output of the file
 * @property {"javascript" | "types" | "meta"} kind - file kind
 * @property {function} build - file generate function
 * @property {"node" | "universal"} platform - ESBuild platform
 * @property {BuildOptions} buildOptions - ESBuild options
 * @property {boolean?} isPlugin - file is a plugin
 * @property {boolean?} addDefaultExport - add default export to bundle
 */

const extensions = {
  esm: ".mjs",
  umd: ".js",
  cjs: ".cjs",
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
        module: getPackageFile(
          "@typescript-eslint/typescript-estree/dist/index.js",
        ),
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
            .replace('require("@typescript-eslint/project-service")', "{}");
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
        path: path.join(dirname, "./shims/debug.js"),
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
              `".*?" in (?:${typescriptVariables.join("|")})(?=\\W)`,
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

          text = text.replace(/(?<=\n)export .*?;/u, "export { preprocess };");

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
].map((file) => {
  if (typeof file === "string") {
    file = { input: file };
  }

  let { input, umdPropertyName, outputBaseName, ...buildOptions } = file;

  outputBaseName ??= input.match(/\/plugins\/(?<outputBaseName>.*?)\.js$/u)
    .groups.outputBaseName;

  const umdVariableName = `prettierPlugins.${
    umdPropertyName ?? outputBaseName
  }`;

  return {
    input,
    outputBaseName: `plugins/${outputBaseName}`,
    umdVariableName,
    buildOptions,
    isPlugin: true,
  };
});

const nonPluginUniversalFiles = [
  {
    input: "src/document/public.js",
    outputBaseName: "doc",
    umdVariableName: "doc",
    minify: false,
  },
  {
    input: "src/standalone.js",
    umdVariableName: "prettier",
    replaceModule: [
      {
        module: require.resolve("@babel/code-frame"),
        process(text) {
          text = text.replaceAll("var picocolors = require('picocolors');", "");
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
        path: path.join(dirname, "./shims/colors.js"),
      },
    ],
  },
].map((file) => {
  const {
    input,
    outputBaseName = path.basename(input, ".js"),
    umdVariableName,
    ...buildOptions
  } = file;

  return {
    input,
    outputBaseName,
    umdVariableName,
    buildOptions,
  };
});

const universalFiles = [...nonPluginUniversalFiles, ...pluginFiles].flatMap(
  (file) => {
    let { input, outputBaseName, umdVariableName, buildOptions, isPlugin } =
      file;

    outputBaseName ??= path.basename(input);

    return [
      ...[
        {
          format: "esm",
          file: `${outputBaseName}${extensions.esm}`,
        },
        {
          format: "umd",
          file: `${outputBaseName}${extensions.umd}`,
          umdVariableName,
        },
      ].map((output) => ({
        input,
        output,
        platform: "universal",
        buildOptions: {
          addDefaultExport: output.format === "esm",
          ...buildOptions,
        },
        isPlugin,
        build: buildJavascriptModule,
        kind: "javascript",
        playground: output.format === "esm" && outputBaseName !== "doc",
      })),
      getTypesFileConfig({ input, outputBaseName, isPlugin }),
    ];
  },
);

const nodejsFiles = [
  {
    input: "src/index.js",
    replaceModule: [
      // `editorconfig` use a older version of `semver` and only uses `semver.gte`
      {
        module: require.resolve("editorconfig"),
        find: 'var semver = __importStar(require("semver"));',
        replacement: `
          var semver = {
            gte: require(${JSON.stringify(
              require.resolve("semver/functions/gte"),
            )})
          };
        `,
      },
      {
        module: require.resolve("n-readlines"),
        find: "const readBuffer = new Buffer(this.options.readChunk);",
        replacement: "const readBuffer = Buffer.alloc(this.options.readChunk);",
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
  },
  {
    input: "src/index.cjs",
  },
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
        module: resolveEsmModulePath("cacheable"),
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
].flatMap((file) => {
  let { input, output, outputBaseName, ...buildOptions } = file;

  const format = input.endsWith(".cjs") ? "cjs" : "esm";
  outputBaseName ??= path.basename(input, path.extname(input));

  return [
    {
      input,
      output: {
        format,
        file: `${outputBaseName}${extensions[format]}`,
      },
      platform: "node",
      buildOptions,
      build: buildJavascriptModule,
      kind: "javascript",
    },
    getTypesFileConfig({ input, outputBaseName }),
  ];
});

const metaFiles = [
  {
    input: "package.json",
    output: {
      format: "json",
    },
    build: buildPrettierPackageJson,
  },
  {
    input: "README.md",
    build: copyFileBuilder,
  },
  {
    input: "LICENSE",
    build: copyFileBuilder,
  },
  {
    output: {
      file: "THIRD-PARTY-NOTICES.md",
    },
    build: buildDependenciesLicense,
  },
].map((file) => ({
  ...file,
  output: { file: file.input, ...file.output },
  kind: "meta",
}));

/** @type {Files[]} */
const files = [...nodejsFiles, ...universalFiles, ...metaFiles].filter(Boolean);
export default [
  {
    packageName: "prettier",
    // Used in THIRD-PARTY-NOTICES.md
    packageDisplayName: "Prettier",
    distDirectory: path.join(DIST_DIR, "prettier"),
    files,
  },
  {
    packageName: "@prettier/plugin-oxc",
    distDirectory: path.join(DIST_DIR, "plugin-oxc"),
    files: [
      ...[
        {
          input: "packages/plugin-oxc/index.js",
          addDefaultExport: true,
          external: ["oxc-parser"],
        },
      ].flatMap((file) => {
        let { input, output, outputBaseName, ...buildOptions } = file;

        const format = input.endsWith(".cjs") ? "cjs" : "esm";
        outputBaseName ??= path.basename(input, path.extname(input));

        return [
          {
            input,
            output: {
              format,
              file: `${outputBaseName}${extensions[format]}`,
            },
            platform: "node",
            buildOptions,
            build: buildJavascriptModule,
            kind: "javascript",
          },
          getTypesFileConfig({ input, outputBaseName, isPlugin: true }),
        ];
      }),
      ...[
        {
          input: "packages/plugin-oxc/package.json",
          output: {
            file: "package.json",
            format: "json",
          },
          build: buildPluginOxcPackageJson,
        },
        {
          input: "packages/plugin-oxc/README.md",
          output: {
            file: "README.md",
          },
          build: copyFileBuilder,
        },
        {
          input: "LICENSE",
          output: {
            file: "LICENSE",
          },
          build: copyFileBuilder,
        },
        {
          output: {
            file: "THIRD-PARTY-NOTICES.md",
          },
          build: buildDependenciesLicense,
        },
      ].map((file) => ({
        ...file,
        output: { file: file.input, ...file.output },
        kind: "meta",
      })),
    ],
  },
  {
    packageName: "@prettier/plugin-hermes",
    distDirectory: path.join(DIST_DIR, "plugin-hermes"),
    files: [
      ...[
        {
          input: "packages/plugin-hermes/index.js",
          addDefaultExport: true,
          replaceModule: [
            {
              module: require.resolve("hermes-parser/dist/HermesParser.js"),
              process(text) {
                text =
                  'const Buffer = globalThis.Buffer ?? require("buffer/").Buffer;' +
                  text;
                return text;
              },
            },
            {
              module: require.resolve("hermes-parser/dist/HermesParserWASM.js"),
              process(text) {
                text = text.replaceAll("process.argv", "[]");
                text = text.replaceAll('require("fs")', "undefined");
                text = text.replaceAll('require("path")', "undefined");
                text =
                  'const Buffer = globalThis.Buffer ?? require("buffer/").Buffer;' +
                  text;

                return text;
              },
            },
          ],
        },
      ].flatMap((file) => {
        let { input, output, outputBaseName, ...buildOptions } = file;

        outputBaseName ??= path.basename(input, path.extname(input));
        const format = input.endsWith(".cjs") ? "cjs" : "esm";

        return [
          {
            input,
            output: {
              format,
              file: `${outputBaseName}${extensions[format]}`,
            },
            platform: "universal",
            buildOptions: {
              addDefaultExport: true,
              ...buildOptions,
            },
            isPlugin: true,
            build: buildJavascriptModule,
            playground: true,
            kind: "javascript",
          },
          getTypesFileConfig({ input, outputBaseName, isPlugin: true }),
        ];
      }),
      ...[
        {
          input: "packages/plugin-hermes/package.json",
          output: {
            file: "package.json",
            format: "json",
          },
          build: buildPluginHermesPackageJson,
        },
        {
          input: "packages/plugin-hermes/README.md",
          output: {
            file: "README.md",
          },
          build: copyFileBuilder,
        },
        {
          input: "LICENSE",
          output: {
            file: "LICENSE",
          },
          build: copyFileBuilder,
        },
        {
          output: {
            file: "THIRD-PARTY-NOTICES.md",
          },
          build: buildDependenciesLicense,
        },
      ].map((file) => ({
        ...file,
        output: { file: file.input, ...file.output },
        kind: "meta",
      })),
    ],
  },
];
