/* eslint-env worker */
/* eslint no-var: off, strict: off */
/* globals prettier prettierPlugins */

// this is required to only load parsers when we need them
var parsers = {
  // JS - Babylon
  get babylon() {
    importScripts("lib/parser-babylon.js");
    return prettierPlugins.babylon.parsers.babylon;
  },
  get json() {
    importScripts("lib/parser-babylon.js");
    return prettierPlugins.babylon.parsers.json;
  },
  get json5() {
    importScripts("lib/parser-babylon.js");
    return prettierPlugins.babylon.parsers.json5;
  },
  get "json-stringify"() {
    importScripts("lib/parser-babylon.js");
    return prettierPlugins.babylon.parsers["json-stringify"];
  },
  // JS - Flow
  get flow() {
    importScripts("lib/parser-flow.js");
    return prettierPlugins.flow.parsers.flow;
  },
  // JS - TypeScript
  get typescript() {
    importScripts("lib/parser-typescript.js");
    return prettierPlugins.typescript.parsers.typescript;
  },

  // CSS
  get css() {
    importScripts("lib/parser-postcss.js");
    return prettierPlugins.postcss.parsers.css;
  },
  get less() {
    importScripts("lib/parser-postcss.js");
    return prettierPlugins.postcss.parsers.css;
  },
  get scss() {
    importScripts("lib/parser-postcss.js");
    return prettierPlugins.postcss.parsers.css;
  },

  // GraphQL
  get graphql() {
    importScripts("lib/parser-graphql.js");
    return prettierPlugins.graphql.parsers.graphql;
  },

  // Markdown
  get markdown() {
    importScripts("lib/parser-markdown.js");
    return prettierPlugins.markdown.parsers.remark;
  },

  // Vue
  get vue() {
    importScripts("lib/parser-vue.js");
    return prettierPlugins.vue.parsers.vue;
  }
};

importScripts("lib/standalone.js");
// eslint-disable-next-line no-unused-vars
var PRETTIER_DEBUG = true;

self.onmessage = function(event) {
  self.postMessage({
    uid: event.data.uid,
    message: handleMessage(event.data.message)
  });
};

function handleMessage(message) {
  if (message.type === "meta") {
    return {
      type: "meta",
      supportInfo: JSON.parse(JSON.stringify(prettier.getSupportInfo())),
      version: prettier.version
    };
  }

  if (message.type === "format") {
    var options = message.options || {};

    delete options.ast;
    delete options.doc;
    delete options.output2;

    var plugins = [{ parsers: parsers }];
    options.plugins = plugins;

    var response = {
      formatted: formatCode(message.code, options),
      debug: {
        ast: null,
        doc: null,
        reformatted: null
      }
    };

    if (message.debug.ast) {
      var ast;
      var errored = false;
      try {
        ast = JSON.stringify(prettier.__debug.parse(message.code, options).ast);
      } catch (e) {
        errored = true;
        ast = String(e);
      }

      if (!errored) {
        try {
          ast = formatCode(ast, { parser: "json", plugins: plugins });
        } catch (e) {
          ast = JSON.stringify(ast, null, 2);
        }
      }
      response.debug.ast = ast;
    }

    if (message.debug.doc) {
      try {
        response.debug.doc = prettier.__debug.formatDoc(
          prettier.__debug.printToDoc(message.code, options),
          { parser: "babylon", plugins: plugins }
        );
      } catch (e) {
        response.debug.doc = String(e);
      }
    }

    if (message.debug.reformat) {
      response.debug.reformatted = formatCode(response.formatted, options);
    }

    return response;
  }
}

function formatCode(text, options) {
  try {
    return prettier.format(text, options);
  } catch (e) {
    if (e.constructor && e.constructor.name === "SyntaxError") {
      // Likely something wrong with the user's code
      return String(e);
    }
    // Likely a bug in Prettier
    // Provide the whole stack for debugging
    return e.stack || String(e);
  }
}
