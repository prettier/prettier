"use strict";

const execa = require("execa");
const path = require("path");
const { rollup } = require("rollup");
const webpack = require("webpack");
const resolve = require("@rollup/plugin-node-resolve");
const alias = require("@rollup/plugin-alias");
const commonjs = require("@rollup/plugin-commonjs");
const nodeGlobals = require("rollup-plugin-node-globals");
const json = require("@rollup/plugin-json");
const replace = require("@rollup/plugin-replace");
const { terser } = require("rollup-plugin-terser");
const babel = require("rollup-plugin-babel");
const nativeShims = require("./rollup-plugins/native-shims");
const executable = require("./rollup-plugins/executable");
const evaluate = require("./rollup-plugins/evaluate");
const externals = require("./rollup-plugins/externals");

const EXTERNALS = [
  "assert",
  "buffer",
  "constants",
  "crypto",
  "events",
  "fs",
  "module",
  "os",
  "path",
  "stream",
  "url",
  "util",
  "readline",

  // See comment in jest.config.js
  "graceful-fs"
];

function getBabelConfig(bundle) {
  const config = {
    babelrc: false,
    plugins: bundle.babelPlugins || [],
    compact: bundle.type === "plugin" ? false : "auto"
  };
  config.plugins.push(
    require.resolve("./babel-plugins/replace-array-includes-with-indexof")
  );
  if (bundle.type === "core") {
    config.plugins.push(
      require.resolve("./babel-plugins/transform-custom-require")
    );
  }
  const targets = { node: 4 };
  if (bundle.target === "universal") {
    // From https://jamie.build/last-2-versions
    targets.browsers = [">0.25%", "not ie 11", "not op_mini all"];
  }
  config.presets = [
    [require.resolve("@babel/preset-env"), { targets, modules: false }]
  ];
  return config;
}

function getRollupConfig(bundle) {
  const config = {
    input: bundle.input,

    onwarn(warning) {
      if (
        // We use `eval("require")` to enable dynamic requires in the
        // custom parser API
        warning.code === "EVAL" ||
        // ignore `MIXED_EXPORTS` warn
        warning.code === "MIXED_EXPORTS" ||
        (warning.code === "CIRCULAR_DEPENDENCY" &&
          warning.importer.startsWith("node_modules"))
      ) {
        return;
      }

      // web bundle can't have external requires
      if (
        warning.code === "UNRESOLVED_IMPORT" &&
        bundle.target === "universal"
      ) {
        throw new Error(
          `Unresolved dependency in universal bundle: ${warning.source}`
        );
      }

      console.warn(warning);
    }
  };

  const replaceStrings = {
    "process.env.PRETTIER_TARGET": JSON.stringify(bundle.target),
    "process.env.NODE_ENV": JSON.stringify("production")
  };
  if (bundle.target === "universal") {
    // We can't reference `process` in UMD bundles and this is
    // an undocumented "feature"
    replaceStrings["process.env.PRETTIER_DEBUG"] = "global.PRETTIER_DEBUG";
  }
  Object.assign(replaceStrings, bundle.replace);

  const babelConfig = getBabelConfig(bundle);

  config.plugins = [
    replace({
      values: replaceStrings,
      delimiters: ["", ""]
    }),
    executable(),
    evaluate(),
    json(),
    bundle.alias && alias(bundle.alias),
    bundle.target === "universal" &&
      nativeShims(path.resolve(__dirname, "shims")),
    resolve({
      extensions: [".js", ".json"],
      preferBuiltins: bundle.target === "node"
    }),
    commonjs(
      Object.assign(
        bundle.target === "node" ? { ignoreGlobal: true } : {},
        bundle.commonjs
      )
    ),
    externals(bundle.externals),
    bundle.target === "universal" && nodeGlobals(),
    babelConfig && babel(babelConfig),
    bundle.type === "plugin" && terser()
  ].filter(Boolean);

  if (bundle.target === "node") {
    config.external = EXTERNALS;
  }

  return config;
}

function getRollupOutputOptions(bundle) {
  const options = {
    file: `dist/${bundle.output}`,
    strict: typeof bundle.strict === "undefined" ? true : bundle.strict,
    paths: [{ "graceful-fs": "fs" }]
  };

  if (bundle.target === "node") {
    options.format = "cjs";
  } else if (bundle.target === "universal") {
    options.format = "umd";
    options.name =
      bundle.type === "plugin" ? `prettierPlugins.${bundle.name}` : bundle.name;
  }
  return options;
}

function getWebpackConfig(bundle) {
  if (bundle.type !== "plugin" || bundle.target !== "universal") {
    throw new Error("Must use rollup for this bundle");
  }

  const root = path.resolve(__dirname, "..", "..");
  const config = {
    entry: path.resolve(root, bundle.input),
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: "babel-loader",
            options: getBabelConfig(bundle)
          }
        }
      ]
    },
    output: {
      path: path.resolve(root, "dist"),
      filename: bundle.output,
      library: ["prettierPlugins", bundle.name],
      libraryTarget: "umd",
      // https://github.com/webpack/webpack/issues/6642
      globalObject: 'new Function("return this")()'
    }
  };

  if (bundle.terserOptions) {
    const TerserPlugin = require("terser-webpack-plugin");

    config.optimization = {
      minimizer: [new TerserPlugin(bundle.terserOptions)]
    };
  }

  return config;
}

function runWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = async function createBundle(bundle, cache) {
  const inputOptions = getRollupConfig(bundle);
  const outputOptions = getRollupOutputOptions(bundle);

  const useCache = await cache.checkBundle(
    bundle.output,
    inputOptions,
    outputOptions
  );
  if (useCache) {
    try {
      await execa("cp", [
        path.join(cache.cacheDir, "files", bundle.output),
        "dist"
      ]);
      return { cached: true };
    } catch (err) {
      // Proceed to build
    }
  }

  if (bundle.bundler === "webpack") {
    await runWebpack(getWebpackConfig(bundle));
  } else {
    const result = await rollup(inputOptions);
    await result.write(outputOptions);
  }

  return { bundled: true };
};
