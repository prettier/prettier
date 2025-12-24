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
const umdFiles = {
  prettier: "prettier/standalone.js",
  plugins: [
    "prettier/plugins/angular.js",
    "prettier/plugins/graphql.js",
    "prettier/plugins/typescript.js",
    "prettier/plugins/estree.js",
    "prettier/plugins/markdown.js",
    "prettier/plugins/acorn.js",
    "prettier/plugins/glimmer.js",
    "prettier/plugins/postcss.js",
    "prettier/plugins/babel.js",
    "prettier/plugins/html.js",
    "prettier/plugins/yaml.js",
    "prettier/plugins/flow.js",
    "prettier/plugins/meriyah.js",
    // These two plugins don't have umd version
    "plugin-hermes/index.mjs",
    "plugin-oxc/index.browser.mjs",
  ],
};

async function loadScript(url) {
  const { document } = globalThis;
  const { head } = document;
  const script = Object.assign(document.createElement("script"), { src: url });

  function on(event, callback) {
    script.addEventListener(event, callback, { once: true, passive: true });
  }

  try {
    await new Promise((resolve, reject) => {
      on("load", resolve);

      on("error", () => {
        reject(new Error(`Failed to load script '${url}'.`));
      });

      head.appendChild(script);
    });
  } finally {
    head.removeChild(script);
  }
}

async function loadEsmPrettier() {
  const [prettier, ...builtinPlugins] = await Promise.all(
    [esmFiles.prettier, ...esmFiles.plugins].map((file) => import(`/${file}`)),
  );

  return { prettier, builtinPlugins };
}

async function loadUmdPrettier() {
  const { umdPluginFiles, esmPluginFiles } = Object.groupBy(
    umdFiles.plugins,
    (file) => `${file.endsWith(".mjs") ? "esm" : "umd"}PluginFiles`,
  );

  const [, esmPlugins] = await Promise.all([
    Promise.all(
      [umdFiles.prettier, ...umdPluginFiles].map((file) =>
        loadScript(`/${file}`),
      ),
    ),
    Promise.all(esmPluginFiles.map((file) => import(`/${file}`))),
  ]);

  const { prettier } = globalThis;
  const builtinPlugins = [
    ...Object.values(globalThis.prettierPlugins),
    ...esmPlugins,
  ];
  delete globalThis.prettier;
  delete globalThis.prettierPlugins;
  return { prettier, builtinPlugins };
}

/**
@param {"esm" | "umd"} prettierBundleFormat
*/
function createPrettier(prettierBundleFormat) {
  let cache;
  function loadPrettier() {
    if (!cache) {
      cache =
        prettierBundleFormat === "esm" ? loadEsmPrettier() : loadUmdPrettier();
    }

    return cache;
  }

  const functions = new Map();

  function proxyFunction(accessPath, optionsIndex = 1) {
    let function_;
    return responseInBrowser(
      async (...arguments_) => {
        const { prettier, builtinPlugins } = await loadPrettier();

        if (!functions.has(accessPath)) {
          function_ = prettier;
          for (const property of accessPath.split(".")) {
            function_ = function_[property];
          }
          functions.set(accessPath, function_);
        }

        const options = arguments_[optionsIndex] ?? {};

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

  return {
    formatWithCursor: proxyFunction("formatWithCursor"),
    getSupportInfo: proxyFunction("getSupportInfo", /* optionsIndex */ 0),
    __debug: {
      parse: proxyFunction("__debug.parse"),
    },
  };
}

globalThis.__prettier_esm = createPrettier("esm");
globalThis.__prettier_umd = createPrettier("umd");
