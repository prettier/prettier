import path from "node:path";
import url from "node:url";
import browserslistToEsbuild from "browserslist-to-esbuild";
import esbuild from "esbuild";
import createEsmUtils from "esm-utils";
import projectPackageJson from "../../../package.json" with { type: "json" };
import { PRODUCTION_MINIMAL_NODE_JS_VERSION } from "../../utilities/index.js";
import esbuildPluginAddDefaultExport from "../esbuild-plugins/add-default-export.js";
import esbuildPluginEvaluate from "../esbuild-plugins/evaluate.js";
import esbuildPluginPrimitiveDefine from "../esbuild-plugins/primitive-define.js";
import esbuildPluginReplaceModule from "../esbuild-plugins/replace-module.js";
import esbuildPluginShimCommonjsObjects from "../esbuild-plugins/shim-commonjs-objects.js";
import esbuildPluginStripNodeProtocol from "../esbuild-plugins/strip-node-protocol.js";
import esbuildPluginThrowWarnings from "../esbuild-plugins/throw-warnings.js";
import esbuildPluginUmd from "../esbuild-plugins/umd.js";
import esbuildPluginVisualizer from "../esbuild-plugins/visualizer.js";
import transform from "../transform/index.js";
import { getPackageFile } from "../utilities.js";

const { require, resolve: importMetaResolve } = createEsmUtils(import.meta);

const universalTarget = browserslistToEsbuild(projectPackageJson.browserslist);
const getRelativePath = (from, to) => {
  const relativePath = path.posix.relative(path.dirname(`/${from}`), `/${to}`);
  if (!relativePath.startsWith(".")) {
    return `./${relativePath}`;
  }

  return relativePath;
};

function getEsbuildOptions({ packageConfig, file, cliOptions, buildOptions }) {
  const { sourceDirectory, distDirectory } = packageConfig;

  // Save dependencies to file
  file.dependencies = [];

  const replaceModule = [
    /*
    `jest-docblock` try to detect new line in code, and it will fallback to `os.EOL`,
    We already replaced line end to `\n` before calling it
    */
    {
      module: url.fileURLToPath(importMetaResolve("jest-docblock")),
      path: require.resolve("jest-docblock"),
    },
    {
      module: require.resolve("jest-docblock"),
      process(text) {
        const exports = [
          ...text.matchAll(
            /(?<=\n)exports\.(?<specifier>\w+) = \k<specifier>;/gu,
          ),
        ].map((match) => match.groups.specifier);

        const lines = text.split("\n");
        const startMarkLine = lines.findIndex((line) =>
          line.includes("function _interopRequireDefault"),
        );
        const endMarkLine = lines.indexOf(
          "module.exports = __webpack_exports__;",
        );

        if (
          lines[startMarkLine + 1] !== "/**" ||
          lines[endMarkLine - 2] !== "})();"
        ) {
          throw new Error("Unexpected source");
        }

        text = lines.slice(startMarkLine + 1, endMarkLine - 2).join("\n");

        text = text
          .replace(
            "const line = (0, _detectNewline().default)(docblock) ?? _os().EOL;",
            String.raw`const line = "\n"`,
          )
          .replace(
            "const line = (0, _detectNewline().default)(comments) ?? _os().EOL;",
            String.raw`const line = "\n"`,
          );

        text += "\n\n" + `export {${exports.join(", ")}};`;

        return text;
      },
    },
    // Transform `.at`, `Object.hasOwn`, and `String#replaceAll`
    {
      module: "*",
      process: (text, file) => transform(text, file, buildOptions),
    },
    // #12493, not sure what the problem is, but replace the cjs version with esm version seems fix it
    {
      module: require.resolve("tslib"),
      path: require.resolve("tslib").replace(/tslib\.js$/u, "tslib.es6.js"),
    },
    // https://github.com/evanw/esbuild/issues/2103
    {
      module: getPackageFile("outdent/lib-module/index.js"),
      process(text) {
        const index = text.indexOf('if (typeof module !== "undefined") {');
        if (index === -1) {
          throw new Error("Unexpected code");
        }
        return text.slice(0, index);
      },
    },
  ];

  const define = {
    "process.env.PRETTIER_TARGET": buildOptions.platform,
    "process.env.NODE_ENV": "production",
  };

  if (buildOptions.platform === "universal") {
    // We can't reference `process` in UMD bundles and this is
    // an undocumented "feature"
    replaceModule.push({
      module: "*",
      find: "process.env.PRETTIER_DEBUG",
      replacement: "globalThis.PRETTIER_DEBUG",
    });

    define.process = undefined;
    // @babel/code-frame/lib/index.js
    define["process.emitWarning"] = undefined;
    // postcss/lib/postcss.js
    define["process.env.LANG"] = "";
    // @typescript-eslint/typescript-estree
    define["process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER"] = "";

    // Replace `__dirname` and `__filename` with a fake value
    // So `parser-typescript.js` won't contain a path of working directory
    // See #8268
    define.__filename = "/prettier-security-filename-placeholder.js";
    define.__dirname = "/prettier-security-dirname-placeholder";
  }

  // External other bundled files
  if (buildOptions.platform === "node") {
    const files = packageConfig.modules
      .flatMap((module) => module.files)
      .filter(
        (bundle) =>
          bundle.input === "package.json" ||
          (file.input &&
            file.input !== bundle.input &&
            bundle.output.endsWith(".mjs")),
      );
    const replacements = files.map((bundle) => {
      let { output } = bundle;
      if (file.output === "index.cjs" && output === "doc.mjs") {
        output = "doc.js";
      }

      return {
        module: path.join(sourceDirectory, bundle.input),
        external: getRelativePath(file.output, output),
      };
    });
    replaceModule.push(...replacements);
  }

  // Current version of `yaml` is not tree-shakable,
  // but when we update it, we may reduce size,
  // since the UMD version don't need expose `__parsePrettierYamlConfig`
  if (buildOptions.format === "umd" && file.output === "plugins/yaml.js") {
    replaceModule.push({
      module: path.join(sourceDirectory, file.input),
      text: 'export * from "../language-yaml/index.js";',
    });
  }

  const shouldMinify =
    cliOptions.minify ??
    buildOptions.minify ??
    buildOptions.platform === "universal";

  const esbuildOptions = {
    entryPoints: [path.join(sourceDirectory, file.input)],
    bundle: true,
    metafile: true,
    plugins: [
      esbuildPluginPrimitiveDefine({ ...define, ...buildOptions.define }),
      esbuildPluginEvaluate(),
      esbuildPluginStripNodeProtocol(),
      esbuildPluginReplaceModule({
        replacements: [...(buildOptions.replaceModule ?? []), ...replaceModule],
      }),
      cliOptions.reports &&
        esbuildPluginVisualizer({ formats: cliOptions.reports }),
      esbuildPluginThrowWarnings({
        allowDynamicRequire: buildOptions.platform === "node",
        allowDynamicImport: buildOptions.platform === "node",
        allowedWarnings: buildOptions.allowedWarnings,
      }),
      buildOptions.addDefaultExport && esbuildPluginAddDefaultExport(),
    ].filter(Boolean),
    minify: shouldMinify,
    legalComments: "none",
    external: ["pnpapi", ...(buildOptions.external ?? [])],
    // Disable esbuild auto discover `tsconfig.json` file
    tsconfigRaw: JSON.stringify({}),
    target: [
      ...(buildOptions.target ?? [`node${PRODUCTION_MINIMAL_NODE_JS_VERSION}`]),
    ],
    logLevel: "error",
    format: buildOptions.format,
    outfile: path.join(distDirectory, cliOptions.saveAs ?? file.output),
    // https://esbuild.github.io/api/#main-fields
    mainFields:
      buildOptions.platform === "node" ? ["module", "main"] : undefined,
    supported: {
      ...buildOptions.supported,
      // https://github.com/evanw/esbuild/issues/3471
      "regexp-unicode-property-escapes": true,
      // Maybe because Node.js v14 doesn't support "spread parameters after optional chaining" https://node.green/
      "optional-chain": true,
      // Maybe because https://github.com/evanw/esbuild/pull/3167?
      "class-field": true,
      "class-private-field": true,
      "class-private-method": true,
    },
    packages: "bundle",
  };

  if (buildOptions.platform === "universal") {
    if (!buildOptions.target) {
      esbuildOptions.target.push(...universalTarget);
    }

    if (buildOptions.format === "umd") {
      esbuildOptions.plugins.push(
        esbuildPluginUmd({
          name: buildOptions.umdVariableName,
        }),
      );
    }
  } else {
    esbuildOptions.platform = "node";

    // https://github.com/evanw/esbuild/issues/1921
    if (buildOptions.format === "esm") {
      esbuildOptions.plugins.push(esbuildPluginShimCommonjsObjects());
    }
  }

  return esbuildOptions;
}

function createJavascriptModuleBuilder(buildOptions) {
  return async function runEsbuild({ packageConfig, file, cliOptions }) {
    if (typeof buildOptions === "function") {
      buildOptions = await buildOptions();
    }

    const esbuildOptions = getEsbuildOptions({
      packageConfig,
      file,
      cliOptions,
      buildOptions,
    });
    return { esbuildResult: await esbuild.build(esbuildOptions) };
  };
}

export { createJavascriptModuleBuilder };
