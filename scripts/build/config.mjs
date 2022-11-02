import path from "node:path";
import { createRequire } from "node:module";
import createEsmUtils from "esm-utils";
import { PROJECT_ROOT, DIST_DIR, copyFile } from "../utils/index.mjs";
import buildJavascriptModule from "./build-javascript-module.js";
import buildPackageJson from "./build-package-json.js";
import buildLicense from "./build-license.js";
import modifyTypescriptModule from "./modify-typescript-module.mjs";
import reuseDocumentModule from "./reuse-document-module.js";

const { require, dirname } = createEsmUtils(import.meta);

/**
 * @typedef {Object} BuildOptions
 * @property {object[]?} replaceModule - Module replacements
 * @property {string[]?} target - ESBuild targets
 * @property {string[]?} external - array of paths that should not be included in the final bundle
 * @property {boolean?} interopDefault - interop default export
 * @property {boolean?} minify - disable code minification
 *
 * @typedef {Object} Output
 * @property {'esm' | 'umd' | 'cjs' | 'text' | 'json'} format - File format
 * @property {string} file - path of the output file in the `dist/` folder
 * @property {string?} umdVariableName - name for the UMD file (for plugins, it'll be `prettierPlugins.${name}`)
 *
 * @typedef {Object} File
 * @property {string?} input - input of the file
 * @property {Output} output - output of the file
 * @property {function} build - file generate function
 * @property {'node' | 'universal'} platform - ESBuild platform
 * @property {BuildOptions} buildOptions - ESBuild options
 * @property {boolean?} isPlugin - file is a plugin
 * @property {boolean?} isMeta - file is a meta file (package.json, LICENSE README.md)
 */

/*
`diff` use deprecated folder mapping "./" in the "exports" field,
so we can't `require("diff/lib/diff/array.js")` directly.
To reduce the bundle size, replace the entry with smaller files.

We can switch to deep require once https://github.com/kpdecker/jsdiff/pull/351 get merged
*/
const diffPackageDirectory = path.dirname(require.resolve("diff/package.json"));
const replaceDiffPackageEntry = (file) => ({
  module: path.join(diffPackageDirectory, "lib/index.mjs"),
  path: path.join(diffPackageDirectory, file),
});

const extensions = {
  esm: ".mjs",
  umd: ".js",
  cjs: ".cjs",
};

const pluginFiles = [
  "src/language-js/parse/babel.js",
  "src/language-js/parse/flow.js",
  {
    input: "src/language-js/parse/typescript.js",
    replaceModule: [
      {
        module: require.resolve("typescript"),
        process: modifyTypescriptModule,
      },
      {
        module: require.resolve(
          "@typescript-eslint/typescript-estree/dist/parser.js"
        ),
        process(text) {
          text = text
            .replace('require("globby")', "{}")
            .replace('require("is-glob")', "{}")
            .replace('require("semver")', "{}")
            .replace('require("path")', "{}")
            .replace('require("./create-program/createDefaultProgram")', "{}")
            .replace('require("./create-program/createIsolatedProgram")', "{}")
            .replace('require("./create-program/createProjectProgram")', "{}")
            .replace(
              'require("./create-program/shared")',
              "{ensureAbsolutePath: path => path}"
            )
            .replace('require("./create-program/useProvidedPrograms")', "{}")
            .replace(
              "process.cwd()",
              JSON.stringify("/prettier-security-dirname-placeholder")
            )
            .replace("warnAboutTSVersion();", "// warnAboutTSVersion();")
            .replace(
              "const isRunningSupportedTypeScriptVersion = ",
              "const isRunningSupportedTypeScriptVersion = true || "
            )
            .replace("extra.projects = ", "extra.projects = [] || ")
            .replace("inferSingleRun(options);", "// inferSingleRun(options);");
          return text;
        },
      },
      {
        module: require.resolve(
          "@typescript-eslint/typescript-estree/dist/create-program/getScriptKind.js"
        ),
        process: (text) =>
          text.replace(
            'require("path")',
            "{extname: file => file.split('.').pop()}"
          ),
      },
      {
        module: require.resolve(
          "@typescript-eslint/typescript-estree/dist/version-check.js"
        ),
        text: "module.exports.typescriptVersionIsAtLeast = new Proxy({}, {get: () => true})",
      },
      // Only needed if `range`/`loc` in parse options is `false`
      {
        module: require.resolve(
          "@typescript-eslint/typescript-estree/dist/ast-converter.js"
        ),
        process: (text) => text.replace('require("./simple-traverse")', "{}"),
      },
      {
        module: require.resolve("debug/src/browser.js"),
        path: path.join(dirname, "./shims/debug.js"),
      },
    ],
  },
  {
    input: "src/language-js/parse/acorn-and-espree.js",
    umdPropertyName: "acornAndEspree",
    replaceModule: [
      {
        module: require.resolve("espree"),
        find: "const Syntax = (function() {",
        replacement: "const Syntax = undefined && (function() {",
      },
      {
        module: require.resolve("espree"),
        find: "var visitorKeys = require('eslint-visitor-keys');",
        replacement: "var visitorKeys;",
      },
    ],
  },
  "src/language-js/parse/meriyah.js",
  {
    input: "src/language-js/parse/angular.js",
    replaceModule: [
      // We only use a small set of `@angular/compiler` from `esm2020/src/expression_parser/`
      // Those files can't be imported, they also not directly runnable, because `.mjs` extension is missing
      {
        module: path.join(
          path.dirname(require.resolve("@angular/compiler/package.json")),
          "fesm2020/compiler.mjs"
        ),
        text: /* indent */ `
          export * from '../esm2020/src/expression_parser/ast.mjs';
          export {Lexer} from '../esm2020/src/expression_parser/lexer.mjs';
          export {Parser} from '../esm2020/src/expression_parser/parser.mjs';
        `,
      },
      ...[
        "expression_parser/lexer.mjs",
        "expression_parser/parser.mjs",
        "ml_parser/interpolation_config.mjs",
      ].map((file) => ({
        module: path.join(
          path.dirname(require.resolve("@angular/compiler/package.json")),
          `esm2020/src/${file}`
        ),
        process: (text) =>
          text.replaceAll(/(?<=import .*? from )'(.{1,2}\/.*)'/g, "'$1.mjs'"),
      })),
    ],
  },
  {
    input: "src/language-css/parser-postcss.js",
    replaceModule: [
      // `postcss-values-parser` uses constructor.name, it will be changed by bundler
      // https://github.com/shellscape/postcss-values-parser/blob/c00f858ab8c86ce9f06fdb702e8f26376f467248/lib/parser.js#L499
      {
        module: require.resolve("postcss-values-parser/lib/parser.js"),
        find: "node.constructor.name === 'Word'",
        replacement: "node.type === 'word'",
      },
      // The following two replacements prevent load `source-map` module
      {
        module: path.join(require.resolve("postcss"), "../previous-map.js"),
        text: "module.exports = class {};",
      },
      {
        module: path.join(require.resolve("postcss"), "../map-generator.js"),
        text: "module.exports = class { generate() {} };",
      },
      // Prevent `node:util`, `node:utl`, and `node:path` shim
      {
        module: require.resolve("postcss-values-parser/lib/tokenize.js"),
        process: (text) =>
          text
            .replace("require('util')", "{}")
            .replace(
              "let message = util.format('Unclosed %s at line: %d, column: %d, token: %d', what, line, pos - offset, pos);",
              "let message = `Unclosed ${what} at line: ${line}, column: ${pos - offset}, token: ${pos}`;"
            )
            .replace(
              "let message = util.format('Syntax error at line: %d, column: %d, token: %d', line, pos - offset, pos);",
              "let message = `Syntax error at line: ${line}, column: ${pos - offset}, token: ${pos}`;"
            ),
      },
      {
        module: path.join(require.resolve("postcss"), "../input.js"),
        process: (text) =>
          text.replace("require('url')", "{}").replace("require('path')", "{}"),
      },
    ],
  },
  "src/language-graphql/parser-graphql.js",
  {
    input: "src/language-markdown/parser-markdown.js",
    replaceModule: [
      {
        module: require.resolve("parse-entities/decode-entity.browser.js"),
        path: require.resolve("parse-entities/decode-entity.js"),
      },
    ],
  },
  {
    input: "src/language-handlebars/parser-glimmer.js",
    replaceModule: [
      // See comment in `src/language-handlebars/parser-glimmer.js` file
      {
        module: require.resolve(
          "@glimmer/syntax/dist/commonjs/es2017/lib/parser/tokenizer-event-handlers.js"
        ),
        path: require.resolve(
          "@glimmer/syntax/dist/modules/es2017/lib/parser/tokenizer-event-handlers.js"
        ),
      },
      // This passed to plugins, our plugin don't need access to the options
      {
        module: require.resolve(
          "@glimmer/syntax/dist/modules/es2017/lib/parser/tokenizer-event-handlers.js"
        ),
        process: (text) =>
          text.replace(/\nconst syntax = \{.*?\n\};/su, "\nconst syntax = {};"),
      },
      {
        module: path.join(
          path.dirname(require.resolve("@handlebars/parser/package.json")),
          "dist/esm/index.js"
        ),
        path: path.join(
          path.dirname(require.resolve("@handlebars/parser/package.json")),
          "dist/esm/parse.js"
        ),
      },
    ],
  },
  "src/language-html/parser-html.js",
  "src/language-yaml/parser-yaml.js",
].map((file) => {
  if (typeof file === "string") {
    file = { input: file };
  }

  let { input, umdPropertyName, outputBaseName, ...buildOptions } = file;

  outputBaseName ??= input.match(
    /(?:parser-|parse\/)(?<outputBaseName>.*?)\.js$/
  ).groups.outputBaseName;

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
    input: "src/document/index.js",
    outputBaseName: "doc",
    umdVariableName: "doc",
    interopDefault: false,
    minify: false,
  },
  {
    input: "src/standalone.js",
    umdVariableName: "prettier",
    interopDefault: false,
    replaceModule: [
      {
        module: require.resolve("@babel/highlight"),
        path: path.join(dirname, "./shims/babel-highlight.js"),
      },
      {
        module: createRequire(require.resolve("vnopts")).resolve("chalk"),
        path: path.join(dirname, "./shims/chalk.js"),
      },
      replaceDiffPackageEntry("lib/diff/array.js"),
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
      buildOptions,
      isPlugin,
    }));
  }
);

const nodejsFiles = [
  {
    input: "src/index.js",
    replaceModule: [
      {
        module: require.resolve("@iarna/toml/lib/toml-parser.js"),
        find: "const utilInspect = eval(\"require('util').inspect\")",
        replacement: "const utilInspect = require('util').inspect",
      },
      // `editorconfig` use a older version of `semver` and only uses `semver.gte`
      {
        module: require.resolve("editorconfig"),
        find: 'var semver = __importStar(require("semver"));',
        replacement: `
          var semver = {
            gte: require(${JSON.stringify(
              require.resolve("semver/functions/gte")
            )})
          };
        `,
      },
      replaceDiffPackageEntry("lib/diff/array.js"),
      ...reuseDocumentModule(),
    ],
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
        process: (text) =>
          text.replace('"../src/cli/index.js"', '"../internal/cli.mjs"'),
      },
    ],
  },
  {
    input: "src/cli/index.js",
    outputBaseName: "internal/cli",
    external: ["benchmark"],
    replaceModule: [replaceDiffPackageEntry("lib/patch/create.js")],
  },
  {
    input: "src/common/third-party.js",
    outputBaseName: "internal/third-party",
    replaceModule: [
      // cosmiconfig@6 -> import-fresh can't find parentModule, since module is bundled
      {
        module: require.resolve("parent-module"),
        path: path.join(dirname, "./shims/parent-module.cjs"),
      },
    ],
  },
].map((file) => {
  let { input, output, outputBaseName, ...buildOptions } = file;

  const format = input.endsWith(".cjs") ? "cjs" : "esm";
  outputBaseName ??= path.basename(input, path.extname(input));

  return {
    input,
    output: {
      format,
      file: `${outputBaseName}${extensions[format]}`,
    },
    platform: "node",
    buildOptions,
  };
});

const metaFiles = [
  {
    input: "package.json",
    output: {
      format: "json",
      file: "package.json",
    },
    build: buildPackageJson,
  },
  {
    output: {
      format: "text",
      file: "README.md",
    },
    async build() {
      await copyFile(
        path.join(PROJECT_ROOT, "README.md"),
        path.join(DIST_DIR, "README.md")
      );
    },
  },
  {
    output: {
      format: "text",
      file: "LICENSE",
    },
    build: buildLicense,
  },
].map((file) => ({ ...file, isMetaFile: true }));

/** @type {Files[]} */
const files = [
  ...[...nodejsFiles, ...universalFiles].map((file) => ({
    ...file,
    build: buildJavascriptModule,
  })),
  ...metaFiles,
];
export default files;
