/* globals prettier prettierPlugins parsersLocation */

"use strict";

self.PRETTIER_DEBUG = true;

const imported = Object.create(null);
function importScriptOnce(url) {
  if (!imported[url]) {
    imported[url] = true;
    importScripts(url);
  }
}

importScripts("lib/parsers-location.js");
importScripts("lib/standalone.js");

// this is required to only load parsers when we need them
const parsers = Object.create(null);
for (const file in parsersLocation) {
  const { parsers: moduleParsers, property } = parsersLocation[file];
  const url = `lib/${file}`;
  for (const parserName of moduleParsers) {
    Object.defineProperty(parsers, parserName, {
      get() {
        importScriptOnce(url);
        return prettierPlugins[property].parsers[parserName];
      },
    });
  }
}

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
        : value,
    2
  );
}

async function handleMessage(message) {
  if (message.type === "meta") {
    const supportInfo = await prettier.getSupportInfo({ showUnreleased: true });

    return {
      type: "meta",
      supportInfo: JSON.parse(JSON.stringify(supportInfo)),
      version: prettier.version,
    };
  }

  if (message.type === "format") {
    const options = message.options || {};

    delete options.ast;
    delete options.doc;
    delete options.output2;

    const plugins = [{ parsers }];
    options.plugins = plugins;

    const formatResult = await formatCode(message.code, options);

    const response = {
      formatted: formatResult.formatted,
      debug: {
        ast: null,
        doc: null,
        comments: null,
        reformatted: null,
      },
    };

    if (message.debug.ast) {
      let ast;
      let errored = false;
      try {
        ast = serializeAst(
          (await prettier.__debug.parse(message.code, options)).ast
        );
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
      response.debug.ast = ast;
    }

    if (message.debug.doc) {
      try {
        response.debug.doc = await prettier.__debug.formatDoc(
          await prettier.__debug.printToDoc(message.code, options),
          { parser: "babel", plugins }
        );
      } catch (e) {
        response.debug.doc = String(e);
      }
    }

    if (message.debug.comments) {
      response.debug.comments = (
        await formatCode(JSON.stringify(formatResult.comments || []), {
          parser: "json",
          plugins,
        })
      ).formatted;
    }

    if (message.debug.reformat) {
      response.debug.reformatted = (
        await formatCode(response.formatted, options)
      ).formatted;
    }

    return response;
  }
}

async function formatCode(text, options) {
  try {
    return await prettier.formatWithCursor(text, options);
  } catch (e) {
    if (e.constructor && e.constructor.name === "SyntaxError") {
      // Likely something wrong with the user's code
      return { formatted: String(e) };
    }
    // Likely a bug in Prettier
    // Provide the whole stack for debugging
    return { formatted: e.stack || String(e) };
  }
}
