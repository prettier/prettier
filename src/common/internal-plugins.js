"use strict";

// We need to do this to prevent rollup from hoisting the requires. A babel
// plugin will look for `$$$r()` and transform to `require()` in the bundle,
// and rewrite the paths to require from the top-level.
const $$$r = require;

// We need to list the parsers and getters so we can load them only when necessary.
module.exports = [
  // JS
  require("../language-js"),
  {
    parsers: {
      // JS - Babylon
      get babylon() {
        return $$$r("../language-js/parser-babylon").parsers.babylon;
      },
      get json() {
        return $$$r("../language-js/parser-babylon").parsers.json;
      },
      get json5() {
        return $$$r("../language-js/parser-babylon").parsers.json5;
      },
      get "json-stringify"() {
        return $$$r("../language-js/parser-babylon").parsers["json-stringify"];
      },
      // JS - Flow
      get flow() {
        return $$$r("../language-js/parser-flow").parsers.flow;
      },
      // JS - TypeScript
      get typescript() {
        return $$$r("../language-js/parser-typescript").parsers.typescript;
      },
      get "typescript-eslint"() {
        return $$$r("../language-js/parser-typescript").parsers[
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
        return $$$r("../language-css/parser-postcss").parsers.css;
      },
      get less() {
        return $$$r("../language-css/parser-postcss").parsers.css;
      },
      get scss() {
        return $$$r("../language-css/parser-postcss").parsers.css;
      }
    }
  },

  // Handlebars
  require("../language-handlebars"),
  {
    parsers: {
      get glimmer() {
        return $$$r("../language-handlebars/parser-glimmer").parsers.glimmer;
      }
    }
  },

  // GraphQL
  require("../language-graphql"),
  {
    parsers: {
      get graphql() {
        return $$$r("../language-graphql/parser-graphql").parsers.graphql;
      }
    }
  },

  // Markdown
  require("../language-markdown"),
  {
    parsers: {
      get remark() {
        return $$$r("../language-markdown/parser-markdown").parsers.remark;
      },
      // TODO: Delete this in 2.0
      get markdown() {
        return $$$r("../language-markdown/parser-markdown").parsers.remark;
      }
    }
  },

  // HTML
  require("../language-html"),
  {
    parsers: {
      get parse5() {
        return $$$r("../language-html/parser-parse5").parsers.parse5;
      }
    }
  },

  // Vue
  require("../language-vue"),
  {
    parsers: {
      get vue() {
        return $$$r("../language-vue/parser-vue").parsers.vue;
      }
    }
  }
];
