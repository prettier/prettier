/* eslint-env worker */
/* eslint no-var: off, strict: off */
/* globals prettier prettierPlugins */

var imported = Object.create(null);
function importScriptOnce(url) {
  if (!imported[url]) {
    imported[url] = true;
    importScripts(url);
  }
}

// this is required to only load parsers when we need them
var parsers = {
  // JS - Babylon
  get babylon() {
    importScriptOnce("lib/parser-babylon.js");
    return prettierPlugins.babylon.parsers.babylon;
  },
  get json() {
    importScriptOnce("lib/parser-babylon.js");
    return prettierPlugins.babylon.parsers.json;
  },
  get json5() {
    importScriptOnce("lib/parser-babylon.js");
    return prettierPlugins.babylon.parsers.json5;
  },
  get "json-stringify"() {
    importScriptOnce("lib/parser-babylon.js");
    return prettierPlugins.babylon.parsers["json-stringify"];
  },
  get __js_expression() {
    importScriptOnce("lib/parser-babylon.js");
    return prettierPlugins.babylon.parsers.__js_expression;
  },
  get __vue_expression() {
    importScriptOnce("lib/parser-babylon.js");
    return prettierPlugins.babylon.parsers.__vue_expression;
  },
  // JS - Flow
  get flow() {
    importScriptOnce("lib/parser-flow.js");
    return prettierPlugins.flow.parsers.flow;
  },
  // JS - TypeScript
  get typescript() {
    importScriptOnce("lib/parser-typescript.js");
    return prettierPlugins.typescript.parsers.typescript;
  },
  // JS - Angular Action
  get __ng_action() {
    importScriptOnce("lib/parser-angular.js");
    return prettierPlugins.angular.parsers.__ng_action;
  },
  // JS - Angular Binding
  get __ng_binding() {
    importScriptOnce("lib/parser-angular.js");
    return prettierPlugins.angular.parsers.__ng_binding;
  },
  // JS - Angular Interpolation
  get __ng_interpolation() {
    importScriptOnce("lib/parser-angular.js");
    return prettierPlugins.angular.parsers.__ng_interpolation;
  },
  // JS - Angular Directive
  get __ng_directive() {
    importScriptOnce("lib/parser-angular.js");
    return prettierPlugins.angular.parsers.__ng_directive;
  },

  // CSS
  get css() {
    importScriptOnce("lib/parser-postcss.js");
    return prettierPlugins.postcss.parsers.css;
  },
  get less() {
    importScriptOnce("lib/parser-postcss.js");
    return prettierPlugins.postcss.parsers.css;
  },
  get scss() {
    importScriptOnce("lib/parser-postcss.js");
    return prettierPlugins.postcss.parsers.css;
  },

  // GraphQL
  get graphql() {
    importScriptOnce("lib/parser-graphql.js");
    return prettierPlugins.graphql.parsers.graphql;
  },

  // Markdown
  get markdown() {
    importScriptOnce("lib/parser-markdown.js");
    return prettierPlugins.markdown.parsers.remark;
  },
  get mdx() {
    importScriptOnce("lib/parser-markdown.js");
    return prettierPlugins.markdown.parsers.mdx;
  },

  // YAML
  get yaml() {
    importScriptOnce("lib/parser-yaml.js");
    return prettierPlugins.yaml.parsers.yaml;
  },

  // Handlebars
  get glimmer() {
    importScriptOnce("lib/parser-glimmer.js");
    return prettierPlugins.glimmer.parsers.glimmer;
  },

  // HTML
  get html() {
    importScriptOnce("lib/parser-html.js");
    return prettierPlugins.html.parsers.html;
  },
  // Vue
  get vue() {
    // TODO(1.15): remove this workaround
    // parser-vue is replaced by parser-html in 1.15+
    try {
      importScriptOnce("lib/parser-vue.js");
      return prettierPlugins.vue.parsers.vue;
    } catch (e) {
      importScriptOnce("lib/parser-html.js");
      return prettierPlugins.html.parsers.vue;
    }
  },
  // Angular
  get angular() {
    importScriptOnce("lib/parser-html.js");
    return prettierPlugins.html.parsers.angular;
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
      supportInfo: JSON.parse(
        JSON.stringify(
          prettier.getSupportInfo(null, {
            showUnreleased: /-pr\./.test(prettier.version)
          })
        )
      ),
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
