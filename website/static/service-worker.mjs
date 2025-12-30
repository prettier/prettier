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

  // Images
  "/prettier.png",
]);

// Default to hit the cache only if there's a network error
toolbox.router.default = toolbox.networkFirst;

// For scripts, stylesheets and images, we can use the "fastest" strategy
// This means you need to reload twice to get new changes
toolbox.router.get(/\.(js|css|png|svg)$/, toolbox.fastest);
