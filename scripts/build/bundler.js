"use strict";

const execa = require("execa");
const path = require("path");
const { rollup } = require("rollup");
const webpack = require("webpack");
const resolve = require("rollup-plugin-node-resolve");
const alias = require("rollup-plugin-alias");
const commonjs = require("rollup-plugin-commonjs");
const nodeGlobals = require("rollup-plugin-node-globals");
const json = require("rollup-plugin-json");
const replace = require("rollup-plugin-replace");
const uglify = require("rollup-plugin-uglify");
const babel = require("rollup-plugin-babel");
const nativeShims = require("./rollup-plugins/native-shims");
const executable = require("./rollup-plugins/executable");
const evaluate = require("./rollup-plugins/evaluate");

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
  const relative = fp => `./${path.basename(fp).replace(/\.js$/, "")}`;
  const paths = (bundle.external || []).reduce(
    (paths, filepath) =>
      Object.assign(paths, { [filepath]: relative(filepath) }),
    { "graceful-fs": "fs" }
  );

  const config = {
    entry: bundle.input,
    paths,

    onwarn(warning) {
      if (
        // We use `eval("require")` to enable dynamic requires in the
        // custom parser API
        warning.code === "EVAL" ||
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
    replace(replaceStrings),
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
    commonjs(bundle.commonjs || {}),
    bundle.target === "universal" && nodeGlobals(),
    babelConfig && babel(babelConfig),
    bundle.type === "plugin" && uglify()
  ].filter(Boolean);

  if (bundle.target === "node") {
    config.external = EXTERNALS.concat(bundle.external);
  }

  return config;
}

function getRollupOutputOptions(bundle) {
  const options = {
    dest: `dist/${bundle.output}`,
    useStrict: typeof bundle.strict === "undefined" ? true : bundle.strict
  };
  if (bundle.target === "node") {
    options.format = "cjs";
  } else if (bundle.target === "universal") {
    options.format = "umd";
    options.moduleName =
      bundle.type === "plugin" ? `prettierPlugins.${bundle.name}` : bundle.name;
  }
  return options;
}

function getWebpackConfig(bundle) {
  if (bundle.type !== "plugin" || bundle.target !== "universal") {
    throw new Error("Must use rollup for this bundle");
  }

  const root = path.resolve(__dirname, "..", "..");
  return {
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
      libraryTarget: "umd"
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production")
      })
    ]
  };
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
  const useCache = await cache.checkBundle(
    bundle.output,
    getRollupConfig(bundle)
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
    const result = await rollup(getRollupConfig(bundle));
    await result.write(getRollupOutputOptions(bundle));
  }

  return { bundled: true };
};
