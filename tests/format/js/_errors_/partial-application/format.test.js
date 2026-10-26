runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // partialApplication
      // https://babeljs.io/docs/babel-plugin-proposal-partial-application#invalid-usage
      "f(x + ?)", // `?` not in top-level Arguments of call
      "x + ?", // `?` not in top-level Arguments of call
      "?.f()", // `?` not in top-level Arguments of call
      // "new f(?)", // `?` not supported in `new`
      // "super(?)", // `?` not supported in |SuperCall|
    ],
  },
  [
    "babel",
    "acorn",
    "espree",
    "meriyah",
    "typescript",
    "babel-ts",
    "oxc",
    "oxc-ts",
    "yuku",
    "yuku-ts",
    "flow",
    "hermes",
  ],
);
