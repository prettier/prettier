run_spec(
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
    // `espree` didn't throw https://github.com/acornjs/acorn/issues/1009
    // "espree",
    "meriyah",
    "flow",
    "typescript",
    "babel-flow",
    "babel-ts",
  ]
);

run_spec(
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
    // `flow` didn't throw https://github.com/facebook/flow/issues/8651
    // "flow",
    // `typescript` didn't throw
    // "typescript",
    "babel-flow",
    "babel-ts",
  ]
);
