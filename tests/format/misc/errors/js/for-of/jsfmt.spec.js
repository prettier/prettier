runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "for (let.foo of []);",
      "for (let().bar of []);",
      "for (let``.bar of []);",
    ],
  },
  [
    "babel",
    "espree",
    "meriyah",
    "flow",
    "typescript",
    "babel-flow",
    "babel-ts",
  ],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["for (async of []);"],
  },
  [
    "babel",
    "acorn",
    "espree",
    // `meriyah` didn't throw https://github.com/meriyah/meriyah/issues/190
    // "meriyah",
    "flow",
    // `typescript` didn't throw
    // "typescript",
    "babel-flow",
    "babel-ts",
  ],
);
