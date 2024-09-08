export default {
  entry: ["index.js", "standalone.js", "src/plugins/*", "scripts/**"],
  ignore: [
    "bin/prettier.js",
    "tests/**",
    "website/**",
    "**/*.d.ts",
    "scripts/build/config.js",
    "scripts/build/build-javascript-module.js",
    "scripts/tools/**",
  ],
  ignoreDependencies: [
    "@types/jest",
    "eslint-formatter-friendly",
    "jest-snapshot-serializer-ansi",
    "ts-expect",
    "renovate",
  ],
  ignoreBinaries: ["test-coverage", "renovate-config-validator"],
};
