import { responseInBrowser } from "./utilities.js";

const browser = navigator.userAgent.includes("Firefox/") ? "firefox" : "chrome";

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
  return responseInBrowser(
    async (...arguments_) => {
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

      const options = arguments_[optionsIndex];

      arguments_[optionsIndex] = {
        ...options,
        plugins: [...builtinPlugins, ...(options.plugins || [])],
      };

      return function_(...arguments_);
    },
    {
      browser,
      accessPath,
      optionsIndex,
    },
  );
}

globalThis.__prettier = {
  formatWithCursor: proxyFunction("formatWithCursor"),
  getSupportInfo: proxyFunction("getSupportInfo", /* optionsIndex */ 0),
  __debug: {
    parse: proxyFunction("__debug.parse"),
  },
};
