export default {
  entry: ["src/plugins/*", "scripts/**"],
  ignore: [
    "tests/**",
    "website/**",
    "**/*.d.ts",
    "scripts/build/config.js",
    "scripts/build/build-javascript-module.js",
    "scripts/tools/**",
  ],
  ignoreDependencies: [
    "eslint-formatter-friendly",
    "jest-snapshot-serializer-ansi",
    "ts-expect",
    "renovate",
  ],
  ignoreBinaries: ["test-coverage", "renovate-config-validator"],
};
