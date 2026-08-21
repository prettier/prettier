runFormatTest(
  {
    snippets: [
      ".js",
      ".cjs",
      ".mjs",
      ".jsx",
      ".ts",
      ".mts",
      ".cts",
      ".tsx",
      ".unset-filepath",
    ].map((extension) => {
      const filename = `test${extension}`;
      return {
        name: filename,
        code: "<div />",
        filename,
      };
    }),
    importMeta: import.meta,
  },
  [
    "babel",
    "babel-ts",
    "acorn",
    "espree",
    "flow",
    "meriyah",
    "typescript",
    "hermes",
    "oxc",
    "oxc-ts",
    "yuku",
    "yuku-ts",
    "__babel_estree",
  ],
  {
    errors: {
      typescript: ["test.ts", "test.mts", "test.cts"],
    },
  },
);
