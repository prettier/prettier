/* eslint-env serviceworker */
/* global toolbox */

"use strict";

importScripts("https://unpkg.com/sw-toolbox@3.6.0/sw-toolbox.js");

toolbox.precache([
  // Scripts
  "lib/standalone.js",
  "lib/parser-babylon.js",
  "lib/parser-flow.js",
  "lib/parser-glimmer.js",
  "lib/parser-graphql.js",
  "lib/parser-markdown.js",
  "lib/parser-parse5.js",
  "lib/parser-postcss.js",
  "lib/parser-typescript.js",
  "lib/parser-vue.js",
  "lib/parser-yaml.js",
  "playground.js",
  "https://unpkg.com/sw-toolbox@3.6.0/sw-toolbox.js",

  // CodeMirror
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/codemirror.css",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/codemirror.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/mode/javascript/javascript.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/mode/xml/xml.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/mode/jsx/jsx.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/mode/css/css.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/mode/markdown/markdown.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/addon/display/rulers.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/addon/search/searchcursor.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/addon/edit/matchbrackets.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/addon/edit/closebrackets.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/addon/comment/comment.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/addon/wrap/hardwrap.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.36.0/keymap/sublime.js",
  "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react/16.3.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.3.1/umd/react-dom.production.min.js",

  // Images
  "/prettier.png"
]);

// Default to hit the cache only if there's a network error
toolbox.router.default = toolbox.networkFirst;

// For scripts, stylesheets and images, we can use the "fastest" strategy
// This means you need to reload twice to get new changes
toolbox.router.get(/\.(js|css|png|svg)$/, toolbox.fastest);
