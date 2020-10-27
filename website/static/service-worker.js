/* global toolbox parsersLocation */

"use strict";

importScripts("lib/parsers-location.js");
importScripts("https://unpkg.com/sw-toolbox@3.6.0/sw-toolbox.js");

const parsers = Object.keys(parsersLocation).map((file) => `lib/${file}`);

toolbox.precache([
  // Scripts
  "lib/standalone.js",
  "lib/parsers-location.js",
  ...parsers,
  "playground.js",
  "https://unpkg.com/sw-toolbox@3.6.0/sw-toolbox.js",

  // CodeMirror; keep this in sync with website/pages/playground/index.html
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/codemirror.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/fold/foldgutter.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/codemirror.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/mode/javascript/javascript.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/mode/xml/xml.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/mode/jsx/jsx.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/mode/css/css.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/mode/markdown/markdown.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/display/placeholder.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/display/rulers.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/search/searchcursor.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/edit/matchbrackets.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/edit/closebrackets.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/comment/comment.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/wrap/hardwrap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/fold/foldcode.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/fold/foldgutter.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/fold/brace-fold.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/keymap/sublime.min.js",

  "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.6/clipboard.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react/17.0.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.1/umd/react-dom.production.min.js",

  // Images
  "/prettier.png",
]);

// Default to hit the cache only if there's a network error
toolbox.router.default = toolbox.networkFirst;

// For scripts, stylesheets and images, we can use the "fastest" strategy
// This means you need to reload twice to get new changes
toolbox.router.get(/\.(js|css|png|svg)$/, toolbox.fastest);
