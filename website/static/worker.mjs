import prettierPackageManifest from "./lib/package-manifest.mjs";
import * as prettier from "./lib/standalone.mjs";

const pluginLoadPromises = new Map();
async function importPlugin(plugin) {
  if (!pluginLoadPromises.has(plugin)) {
    pluginLoadPromises.set(plugin, import(`./lib/${plugin.file}`));
  }

  try {
    return await pluginLoadPromises.get(plugin);
  } catch {
    throw new Error(`Load plugin '${plugin.file}' failed.`);
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

const docExplorerPlugin = {
  parsers: {
    "doc-explorer": {
      parse: (text) =>
        new Function(
          `{ ${Object.keys(prettier.doc.builders)} }`,
          `const result = (${text || "''"}\n); return result;`,
        )(prettier.doc.builders),
      astFormat: "doc-explorer",
    },
  },
  printers: {
    "doc-explorer": {
      print: (path) => path.getValue(),
    },
  },
  languages: [{ name: "doc-explorer", parsers: ["doc-explorer"] }],
};

const plugins = [
  ...prettierPackageManifest.builtinPlugins.map((plugin) =>
    createPlugin(plugin),
  ),
  docExplorerPlugin,
  prettierPackageManifest.builtinPlugins.some((plugin) =>
    plugin.parsers?.includes("hermes"),
  )
    ? {
        languages: [{ name: "hermes", parsers: ["hermes"] }],
      }
    : {},
];

self.onmessage = async function (event) {
  self.postMessage({
    uid: event.data.uid,
    message: await handleMessage(event.data.message),
  });
};

function serializeAst(ast) {
  return JSON.stringify(
    ast,
    (_, value) =>
      value instanceof Error
        ? { name: value.name, message: value.message, ...value }
        : typeof value === "bigint"
          ? `BigInt('${String(value)}')`
          : typeof value === "symbol"
            ? String(value)
            : value,
    2,
  );
}

function handleMessage(message) {
  switch (message.type) {
    case "meta":
      return handleMetaMessage();
    case "format":
      return handleFormatMessage(message);
  }
}

async function handleMetaMessage() {
  const supportInfo = await prettier.getSupportInfo({ plugins });

  return {
    type: "meta",
    // eslint-disable-next-line unicorn/prefer-structured-clone
    supportInfo: JSON.parse(JSON.stringify(supportInfo)),
    version: prettier.version,
  };
}

async function handleFormatMessage(message) {
  const options = { ...message.options, plugins };

  delete options.ast;
  delete options.doc;
  delete options.output2;

  const isDocExplorer = options.parser === "doc-explorer";

  const formatResult = await formatCode(
    message.code,
    options,
    message.debug.rethrowEmbedErrors,
  );

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

  for (const key of ["ast", "preprocessedAst"]) {
    if (!message.debug[key]) {
      continue;
    }

    const preprocessForPrint = key === "preprocessedAst";

    if (isDocExplorer && preprocessForPrint) {
      continue;
    }

    let ast;
    let errored = false;
    try {
      const parsed = await prettier.__debug.parse(message.code, options, {
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
    response.debug[key] = ast;
  }

  if (!isDocExplorer && message.debug.doc) {
    try {
      response.debug.doc = await prettier.__debug.formatDoc(
        await prettier.__debug.printToDoc(message.code, options),
        { plugins },
      );
    } catch {
      response.debug.doc = "";
    }
  }

  if (!isDocExplorer && message.debug.comments) {
    response.debug.comments = (
      await formatCode(JSON.stringify(formatResult.comments || []), {
        parser: "json",
        plugins,
      })
    ).formatted;
  }

  if (!isDocExplorer && message.debug.reformat) {
    response.debug.reformatted = (
      await formatCode(response.formatted, options)
    ).formatted;
  }

  return response;
}

async function formatCode(text, options, rethrowEmbedErrors) {
  if (options.parser === "doc-explorer") {
    options = {
      ...options,
      cursorOffset: undefined,
      rangeStart: undefined,
      rangeEnd: undefined,
    };
  }

  try {
    self.PRETTIER_DEBUG = rethrowEmbedErrors;
    return await prettier.formatWithCursor(text, options);
  } catch (error) {
    if (error.constructor?.name === "SyntaxError") {
      // Likely something wrong with the user's code
      return { formatted: String(error), error: true };
    }
    // Likely a bug in Prettier
    // Provide the whole stack for debugging
    return { formatted: stringifyError(error), error: true };
  } finally {
    self.PRETTIER_DEBUG = undefined;
  }
}

function stringifyError(error) {
  const stringified = String(error);
  if (typeof error.stack !== "string") {
    return stringified;
  }
  if (error.stack.includes(stringified)) {
    // Chrome
    return error.stack;
  }
  // Firefox
  return stringified + "\n" + error.stack;
}
