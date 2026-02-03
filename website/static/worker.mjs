import { createDocExplorerPlugin } from "./prettier-plugin-doc-explorer.mjs";

/**
@import {PlaygroundSettings} from "../playground/composables/playground-settings.js"
@typedef {{ type: "meta" }} MetaMessage
@typedef {{
  type: "format",
  code: string,
  options: any,
  settings: PlaygroundSettings
}} FormatMessage
*/

const workerUrl = new URL(import.meta.url);
const libDir = workerUrl.searchParams.get("lib") || "lib-stable";

let prettierCache;
let prettierPackageManifestCache;
let prettierPluginDocExplorerCache;
let pluginsCache;

async function loadPrettier() {
  if (!prettierCache) {
    prettierCache = import(`./${libDir}/prettier/standalone.mjs`);
  }
  return await prettierCache;
}

async function loadPrettierPackageManifest() {
  if (!prettierPackageManifestCache) {
    prettierPackageManifestCache = import(
      `./${libDir}/package-manifest.mjs`
    ).then((m) => m.default);
  }
  return await prettierPackageManifestCache;
}

async function loadPrettierPluginDocExplorer() {
  if (!prettierPluginDocExplorerCache) {
    const prettier = await loadPrettier();
    const prettierPackageManifest = await loadPrettierPackageManifest();
    prettierPluginDocExplorerCache = createDocExplorerPlugin(
      prettier,
      prettierPackageManifest,
      libDir,
    );
  }
  return prettierPluginDocExplorerCache;
}

async function loadPlugins() {
  if (!pluginsCache) {
    const prettierPackageManifest = await loadPrettierPackageManifest();
    const prettierPluginDocExplorer = await loadPrettierPluginDocExplorer();
    pluginsCache = [
      ...prettierPackageManifest.plugins.map((plugin) => createPlugin(plugin)),
      prettierPluginDocExplorer,
    ];
  }
  return pluginsCache;
}

const pluginLoadPromises = new Map();
async function importPlugin(plugin) {
  if (!pluginLoadPromises.has(plugin)) {
    pluginLoadPromises.set(plugin, import(`./${libDir}/${plugin.file}`));
  }

  try {
    return await pluginLoadPromises.get(plugin);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    throw new Error(`Load plugin '${plugin.file}' failed.`, { cause: error });
  }
}

// Similar to `createParsersAndPrinters` in `src/plugins/builtin-plugins-proxy.js`
function createPlugin(pluginManifest) {
  const { languages, options, defaultOptions } = pluginManifest;

  const parsers = Object.create(null);
  const printers = Object.create(null);
  const plugin = { languages, options, defaultOptions, parsers, printers };

  const loadPlugin = async () => {
    const plugin = await importPlugin(pluginManifest);
    Object.assign(parsers, plugin.parsers);
    Object.assign(printers, plugin.printers);
    return plugin;
  };

  for (const property of ["parsers", "printers"]) {
    for (const name of pluginManifest[property] ?? []) {
      plugin[property][name] = async () => (await loadPlugin())[property][name];
    }
  }

  return plugin;
}

self.onmessage = async function (event) {
  self.postMessage({
    uid: event.data.uid,
    message: await handleMessage(event.data.message),
  });
};

function serializeError(error) {
  const serialized = {
    name: error.name,
    message: error.message,
    ...error,
  };

  if (error.cause instanceof Error) {
    serialized.cause = serializeError(error.cause);
  }

  return serialized;
}

function serializeAst(ast) {
  return JSON.stringify(
    ast,
    (_, value) => {
      if (value instanceof Error) {
        return serializeError(value);
      }

      if (typeof value === "bigint") {
        return `BigInt('${String(value)}')`;
      }

      if (typeof value === "symbol") {
        return String(value);
      }

      return value;
    },
    2,
  );
}

/**
@param {MetaMessage | FormatMessage} message
*/
function handleMessage(message) {
  switch (message.type) {
    case "meta":
      return handleMetaMessage();
    case "format":
      return handleFormatMessage(message);
  }
}

async function handleMetaMessage() {
  const prettier = await loadPrettier();
  const prettierPackageManifest = await loadPrettierPackageManifest();

  const plugins = await loadPlugins();
  const supportInfo = await prettier.getSupportInfo({ plugins });
  return {
    type: "meta",
    // eslint-disable-next-line unicorn/prefer-structured-clone
    supportInfo: JSON.parse(JSON.stringify(supportInfo)),
    version: prettierPackageManifest.version,
  };
}

/**
@param {FormatMessage} message
*/
async function handleFormatMessage(message) {
  const prettier = await loadPrettier();
  const plugins = await loadPlugins();
  let { options, code, settings } = message;
  options = { ...options, plugins };

  const isDocExplorer = options.parser === "doc-explorer";

  const formatResult = await formatCode(code, options, settings);

  const response = {
    formatted: formatResult.formatted,
    cursorOffset: formatResult.cursorOffset,
    error: formatResult.error,
    debug: {
      ast: null,
      doc: null,
      comments: null,
      reformatted: null,
    },
  };

  for (const { resultKey, settingsKey, preprocessForPrint } of [
    {
      resultKey: "ast",
      settingsKey: "showAst",
      preprocessForPrint: false,
    },
    {
      resultKey: "preprocessedAst",
      settingsKey: "showPreprocessedAst",
      preprocessForPrint: true,
    },
  ]) {
    if (!settings[settingsKey]) {
      continue;
    }

    if (isDocExplorer && preprocessForPrint) {
      continue;
    }

    let ast;
    let errored = false;
    try {
      const parsed = await prettier.__debug.parse(code, options, {
        preprocessForPrint,
      });
      ast = serializeAst(parsed.ast);
    } catch (e) {
      errored = true;
      ast = String(e);
    }

    if (!errored) {
      try {
        ast = (await formatCode(ast, { parser: "json", plugins })).formatted;
      } catch {
        ast = serializeAst(ast);
      }
    }
    response.debug[resultKey] = ast;
  }

  if (!isDocExplorer && settings.showDoc) {
    if (formatResult.error) {
      response.debug.doc = formatResult.formatted;
    } else {
      try {
        response.debug.doc = await prettier.__debug.formatDoc(
          await prettier.__debug.printToDoc(code, options),
          { plugins },
        );
      } catch {
        response.debug.doc = "";
      }
    }
  }

  if (!isDocExplorer && settings.showComments) {
    if (formatResult.error) {
      response.debug.comments = formatResult.formatted;
    } else {
      response.debug.comments = (
        await formatCode(JSON.stringify(formatResult.comments || []), {
          parser: "json",
          plugins,
        })
      ).formatted;
    }
  }

  if (!isDocExplorer && settings.showSecondFormat) {
    response.debug.reformatted = (
      await formatCode(response.formatted, options, settings)
    ).formatted;
  }

  return response;
}

/**
@param {string} text
@param {any} options
@param {PlaygroundSettings} settings
*/
async function formatCode(text, options, settings = {}) {
  const prettier = await loadPrettier();
  if (options.parser === "doc-explorer") {
    options = {
      ...options,
      cursorOffset: undefined,
      rangeStart: undefined,
      rangeEnd: undefined,
    };
  }

  try {
    self.PRETTIER_DEBUG = settings.rethrowEmbedErrors;
    return await prettier.formatWithCursor(text, options);
  } catch (error) {
    if (error.constructor?.name === "SyntaxError") {
      // Likely something wrong with the user's code
      return { formatted: String(error), error: true };
    }
    // Likely a bug in Prettier
    // Provide the whole stack for debugging
    return {
      formatted: stringifyError(error),
      error: true,
    };
  } finally {
    self.PRETTIER_DEBUG = undefined;
  }
}

function stringifyError(error) {
  const { stack, cause } = error;

  let stringified = String(error);

  if (typeof stack === "string") {
    if (stack.includes(stringified)) {
      // Chrome
      stringified = stack;
    } else {
      // Firefox
      stringified += "\n" + error.stack;
    }
  }

  if (cause instanceof Error) {
    stringified += "\nCause: " + stringifyError(cause);
  }

  return stringified;
}
