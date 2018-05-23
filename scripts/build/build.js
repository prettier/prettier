"use strict";

const path = require("path");
const { rollup } = require("rollup");
const webpack = require("webpack");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const nodeGlobals = require("rollup-plugin-node-globals");
const json = require("rollup-plugin-json");
const replace = require("rollup-plugin-replace");
const uglify = require("rollup-plugin-uglify");
const babel = require("rollup-plugin-babel");
const nativeShims = require("./rollup-plugins/native-shims");
const executable = require("./rollup-plugins/executable");

const Bundles = require("./bundles");
const util = require("./util");

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
    presets: [],
    plugins: ["external-helpers"]
  };
  if (bundle.type === "core") {
    config.plugins.push(require("./babel-plugins/transform-eval-require"));
  }
  if (bundle.transpile) {
    config.presets.push(["es2015", { modules: false }]);
  }
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
      // We use `eval` to force rollup to code split and
      // ignore warnings from node_modules
      if (
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

      console.log(warning);
    }
  };

  if (bundle.target === "node") {
    Object.assign(config, {
      plugins: [
        replace(
          Object.assign(
            { "process.env.NODE_ENV": "'production'" },
            bundle.replace
          )
        ),
        bundle.executable ? executable() : {},
        json(),

        resolve({
          extensions: [".js", ".json"],
          preferBuiltins: true
        }),

        commonjs(bundle.commonjs || {}),
        babel(getBabelConfig(bundle)),
        bundle.minify ? uglify() : {}
      ],
      external: EXTERNALS.concat(bundle.external)
    });
  } else if (bundle.target === "universal") {
    Object.assign(config, {
      plugins: [
        replace(
          Object.assign(
            {
              "process.env.NODE_ENV": "'production'",
              "process.env.PRETTIER_DEBUG": "global.PRETTIER_DEBUG"
            },
            bundle.replace
          )
        ),
        json(),
        nativeShims(path.resolve(__dirname, "shims")),
        resolve({
          extensions: [".js", ".json"],
          preferBuiltins: false
        }),
        commonjs(bundle.commonjs || {}),
        nodeGlobals()
        // babel(),
        // uglify()
      ]
    });
  } else {
    throw new Error(`Unsupported target: ${bundle.target}`);
  }

  return config;
}

function getRollupOutputOptions(bundle) {
  const options = {
    dest: `dist/${Bundles.getFileOutput(bundle)}`,
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
  if (bundle.target === "node") {
    throw new Error("Unsupported webpack bundle for node");
  }

  const root = path.resolve(__dirname, "..", "..");
  return {
    entry: path.resolve(root, bundle.input),
    output: {
      path: path.resolve(root, "dist"),
      filename: Bundles.getFileOutput(bundle),
      library:
        bundle.type === "plugin"
          ? ["prettierPlugins", bundle.name]
          : bundle.name,
      libraryTarget: "umd"
    }
  };
}

function asyncWebpack(config) {
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

async function createBundle(bundle) {
  const output = Bundles.getFileOutput(bundle);
  console.log(`BUILDING ${output}`);

  if (bundle.bundler === "webpack") {
    await asyncWebpack(getWebpackConfig(bundle));
  } else {
    try {
      const result = await rollup(getRollupConfig(bundle));
      await result.write(getRollupOutputOptions(bundle));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

async function createPackageJson() {
  const pkg = await util.readJson("package.json");
  pkg.bin = "./bin-prettier.js";
  delete pkg.dependencies;
  delete pkg.devDependencies;
  pkg.scripts = {
    prepublishOnly:
      'node -e "assert.equal(require(".").version, require("..").version)"'
  };
  await util.writeJson("dist/package.json", pkg);
}

async function run() {
  await util.asyncRimRaf("dist");

  for (const bundle of Bundles.bundles) {
    await createBundle(bundle, "node");
  }

  await createPackageJson();
}

run();
