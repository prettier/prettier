"use strict";

// We need to use `eval("require")()` to prevent rollup from hoisting the requires. A babel
// plugin will look for `eval("require")()` and transform to `require()` in the bundle,
// and rewrite the paths to require from the top-level.

// We need to list the parsers and getters so we can load them only when necessary.
module.exports = [
  // JS
  require("../language-js"),
  {
    parsers: {
      // JS - Babylon
      get babylon() {
        return eval("require")("../language-js/parser-babylon").parsers.babylon;
      },
      get json() {
        return eval("require")("../language-js/parser-babylon").parsers.json;
      },
      get json5() {
        return eval("require")("../language-js/parser-babylon").parsers.json5;
      },
      get "json-stringify"() {
        return eval("require")("../language-js/parser-babylon").parsers[
          "json-stringify"
        ];
      },
      // JS - Flow
      get flow() {
        return eval("require")("../language-js/parser-flow").parsers.flow;
      },
      // JS - TypeScript
      get typescript() {
        return eval("require")("../language-js/parser-typescript").parsers
          .typescript;
      },
      get "typescript-eslint"() {
        return eval("require")("../language-js/parser-typescript").parsers[
          "typescript-eslint"
        ];
      }
    }
  },

  // CSS
  require("../language-css"),
  {
    parsers: {
      // TODO: switch these to just `postcss` and use `language` instead.
      get css() {
        return eval("require")("../language-css/parser-postcss").parsers.css;
      },
      get less() {
        return eval("require")("../language-css/parser-postcss").parsers.css;
      },
      get scss() {
        return eval("require")("../language-css/parser-postcss").parsers.css;
      }
    }
  },

  // Handlebars
  require("../language-handlebars"),
  {
    parsers: {
      get glimmer() {
        return eval("require")("../language-handlebars/parser-glimmer").parsers
          .glimmer;
      }
    }
  },

  // GraphQL
  require("../language-graphql"),
  {
    parsers: {
      get graphql() {
        return eval("require")("../language-graphql/parser-graphql").parsers
          .graphql;
      }
    }
  },

  // Markdown
  require("../language-markdown"),
  {
    parsers: {
      get remark() {
        return eval("require")("../language-markdown/parser-markdown").parsers
          .remark;
      },
      // TODO: Delete this in 2.0
      get markdown() {
        return eval("require")("../language-markdown/parser-markdown").parsers
          .remark;
      }
    }
  },

  // HTML
  require("../language-html"),
  {
    parsers: {
      get parse5() {
        return eval("require")("../language-html/parser-parse5").parsers.parse5;
      }
    }
  },

  // Vue
  require("../language-vue"),
  {
    parsers: {
      get vue() {
        return eval("require")("../language-vue/parser-vue").parsers.vue;
      }
    }
  }
];
