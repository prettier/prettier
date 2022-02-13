run_spec(__dirname, ["babel", "babel-ts", "babel-flow"], {
  errors: {
    espree: [
      "basic.js",
      "computed.js",
      "private.js",
      "static-computed.js",
      "static-private.js",
      "static.js",
    ],
    acorn: [
      "basic.js",
      "computed.js",
      "private.js",
      "static-computed.js",
      "static-private.js",
      "static.js",
    ],
  },
});
