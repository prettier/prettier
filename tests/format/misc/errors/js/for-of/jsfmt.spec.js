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
    // Espree didn't throw https://github.com/acornjs/acorn/issues/1009
    // "espree",
    "meriyah",
    "flow",
    "typescript",
    "babel-flow",
    "babel-ts",
  ]
);
