/* eslint-env serviceworker */
/* global toolbox */

"use strict";

importScripts("lib/sw-toolbox.js");

toolbox.precache([
  // Scripts
  "lib/prettier-version.js",
  "lib/index.js",
  "lib/parser-babylon.js",
  "lib/parser-typescript.js",
  "lib/parser-postcss.js",
  "lib/parser-flow.js",
  "lib/parser-graphql.js",
  "lib/parser-json.js",
  "playground.js",
  "lib/sw-toolbox.js",
  "lib/sw-toolbox-companion.js",

  // CodeMirror
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/codemirror.css",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/theme/neat.css",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/codemirror.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/mode/javascript/javascript.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/addon/display/rulers.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/addon/search/searchcursor.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/addon/edit/matchbrackets.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/addon/edit/closebrackets.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/addon/comment/comment.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/addon/wrap/hardwrap.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/keymap/sublime.js",

  // Images
  "/prettier.png"
]);

// Default to hit the cache only if there's a network error
toolbox.router.default = toolbox.networkFirst;

// For scripts, stylesheets and images, we can use the "fastest" strategy
// This means you need to reload twice to get new changes
toolbox.router.get(/\.(js|css|png|svg)$/, toolbox.fastest);
