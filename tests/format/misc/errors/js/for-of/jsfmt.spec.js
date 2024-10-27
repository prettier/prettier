run_spec(
  {
    dirname: __dirname,
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
    dirname: __dirname,
    snippets: ["for (async of []);"],
  },
  [
    "babel",
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
