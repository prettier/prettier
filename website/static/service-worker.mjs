import "https://cdnjs.cloudflare.com/ajax/libs/sw-toolbox/3.6.0/sw-toolbox.js";

import prettierPackageManifest from "./lib/package-manifest.mjs";

const { toolbox } = self;
const packageFiles = [
  prettierPackageManifest.prettier,
  ...prettierPackageManifest.plugins,
].map(({ file }) => `./lib/${file}`);

toolbox.precache([
  // Scripts
  "lib/package-manifest.mjs",
  ...packageFiles,
  "https://cdnjs.cloudflare.com/ajax/libs/sw-toolbox/3.6.0/sw-toolbox.js",

  // CodeMirror; keep this in sync with website/pages/playground/index.html
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/fold/foldgutter.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/javascript/javascript.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/xml/xml.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/jsx/jsx.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/css/css.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/markdown/markdown.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/display/placeholder.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/display/rulers.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/search/searchcursor.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/matchbrackets.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/closebrackets.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/comment/comment.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/wrap/hardwrap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/fold/foldcode.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/fold/foldgutter.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/fold/brace-fold.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/keymap/sublime.min.js",

  "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.11/clipboard.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",

  // Images
  "/prettier.png",
]);

// Default to hit the cache only if there's a network error
toolbox.router.default = toolbox.networkFirst;

// For scripts, stylesheets and images, we can use the "fastest" strategy
// This means you need to reload twice to get new changes
toolbox.router.get(/\.(js|css|png|svg)$/u, toolbox.fastest);
