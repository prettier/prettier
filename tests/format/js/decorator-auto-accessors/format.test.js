const parsers = ["babel", "typescript", "babel-flow"];
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
    "comments.js",
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
    "comments.js",
  ],
};
runFormatTest(import.meta, parsers, { errors });
runFormatTest(import.meta, parsers, { errors, semi: false });
