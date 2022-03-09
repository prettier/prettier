const parsers = ["babel", "babel-ts", "babel-flow"];
const errors = {
  espree: [
    "basic.js",
    "computed.js",
    "private.js",
    "static-computed.js",
    "static-private.js",
    "static.js",
    "with-semicolon-1.js",
    "with-semicolon-2.js",
  ],
  acorn: [
    "basic.js",
    "computed.js",
    "private.js",
    "static-computed.js",
    "static-private.js",
    "static.js",
    "with-semicolon-1.js",
    "with-semicolon-2.js",
  ],
};
run_spec(__dirname, parsers, { errors });
run_spec(__dirname, parsers, { errors, semi: false });
