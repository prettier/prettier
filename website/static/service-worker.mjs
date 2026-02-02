import "https://cdnjs.cloudflare.com/ajax/libs/sw-toolbox/3.6.0/sw-toolbox.js";

import prettierPackageManifestStable from "./lib-stable/package-manifest.mjs";

const { toolbox } = self;

function getPackageFiles(manifest, libDir) {
  return [manifest.prettier, ...manifest.plugins].map(
    ({ file }) => `./${libDir}/${file}`,
  );
}

const stableFiles = getPackageFiles(
  prettierPackageManifestStable,
  "lib-stable",
);

// lib-next may not exist in non-PR builds
let nextFiles = [];
try {
  const prettierPackageManifestNext =
    await import("./lib-next/package-manifest.mjs").then((m) => m.default);
  nextFiles = getPackageFiles(prettierPackageManifestNext, "lib-next");
} catch {
  // lib-next not available
}

toolbox.precache([
  // Scripts
  "lib-stable/package-manifest.mjs",
  ...stableFiles,
  ...nextFiles,
  "https://cdnjs.cloudflare.com/ajax/libs/sw-toolbox/3.6.0/sw-toolbox.js",

  // Images
  "/prettier.png",
]);

// Default to hit the cache only if there's a network error
toolbox.router.default = toolbox.networkFirst;

// For scripts, stylesheets and images, we can use the "fastest" strategy
// This means you need to reload twice to get new changes
toolbox.router.get(/\.(js|css|png|svg)$/, toolbox.fastest);
