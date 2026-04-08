/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  overrides: [
    {
      files: ["**/*.{js,mjs,cjs}"],
      options: {
        parser: "meriyah",
      },
    },
    {
      files: ["bin/prettier.cjs"],
      options: {
        trailingComma: "none",
      },
    },
    {
      files: [".vscode/*.json", "tsconfig.json"],
      options: {
        parser: "jsonc",
      },
    },
  ],
};

export default config;
