export default {
  workspaces: {
    ".": {
      entry: ["src/plugins/*", "scripts/**"],
      project: ["src/**", "scripts/**"],
      ignore: [
        "scripts/build/config.js",
        "scripts/build/build-javascript-module.js",
        "scripts/**",
      ],
      ignoreDependencies: [
        "eslint-formatter-friendly",
        "ts-expect",
        "renovate",
      ],
      ignoreBinaries: ["test-coverage", "renovate-config-validator"],
    },
    website: {
      // Knip doesn't have a Docusaurus plugin yet so until then manual entries:
      entry: [
        "siteConfig.js",
        "core/Footer.js",
        "pages/**/*.js",
        "static/**/*.js",
      ],
      ignoreDependencies: [
        "docusaurus",
        "codemirror",
        "highlight.js",
        "@babel/preset-react",
      ],
      ignoreBinaries: ["docusaurus-build", "docusaurus-version"],
      ignore: ["pages/en/**"],
    },
    "scripts/tools/bundle-test": {},
    "scripts/tools/eslint-plugin-prettier-internal-rules": {},
    "scripts/release": {
      entry: ["release.js"],
    },
  },
};
