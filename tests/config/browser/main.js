import {
  deserializeOptionsInBrowser,
  serializeErrorInBrowser,
} from "./utilities.js";

const esmFiles = {
  prettier: "prettier/standalone.mjs",
  plugins: [
    "prettier/plugins/angular.mjs",
    "prettier/plugins/graphql.mjs",
    "prettier/plugins/typescript.mjs",
    "prettier/plugins/estree.mjs",
    "prettier/plugins/markdown.mjs",
    "prettier/plugins/acorn.mjs",
    "prettier/plugins/glimmer.mjs",
    "prettier/plugins/postcss.mjs",
    "prettier/plugins/babel.mjs",
    "prettier/plugins/html.mjs",
    "prettier/plugins/yaml.mjs",
    "prettier/plugins/flow.mjs",
    "prettier/plugins/meriyah.mjs",
    "plugin-hermes/index.mjs",
    "plugin-oxc/index.browser.mjs",
  ],
};

let prettier;
let builtinPlugins;

function proxyFunction(accessPath, optionsIndex = 1) {
  let function_;
  return async function (...arguments_) {
    if (!prettier) {
      [prettier, ...builtinPlugins] = await Promise.all(
        [esmFiles.prettier, ...esmFiles.plugins].map(
          (file) => import(`/${file}`),
        ),
      );
    }

    if (!function_) {
      function_ = prettier;
      for (const property of accessPath.split(".")) {
        function_ = function_[property];
      }
    }

    const options = deserializeOptionsInBrowser(arguments_[optionsIndex]);

    arguments_[optionsIndex] = {
      ...options,
      plugins: [...builtinPlugins, ...(options.plugins || [])],
    };

    let value;

    try {
      value = await function_(...arguments_);
    } catch (error) {
      return {
        status: "rejected",
        reason: error,
        serializeError: serializeErrorInBrowser(error),
      };
    }

    // Comments in `graphql` can't be serialized
    if (
      function_ === prettier.formatWithCursor &&
      options.parser === "graphql"
    ) {
      value.comments = [];
    }

    return { status: "fulfilled", value };
  };
}

globalThis.__prettier = {
  formatWithCursor: proxyFunction("formatWithCursor"),
  getSupportInfo: proxyFunction("getSupportInfo", /* optionsIndex */ 0),
  __debug: {
    parse: proxyFunction("__debug.parse"),
  },
};
