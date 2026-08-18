runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    babel: ["constructor.js", "method.js", "setter.js"],
    flow: ["constructor.js", "method.js", "setter.js"],
    acorn: ["constructor.js", "method.js", "setter.js"],
    espree: ["constructor.js", "method.js", "setter.js"],
    meriyah: ["constructor.js", "method.js", "setter.js"],
    oxc: ["constructor.js", "method.js", "setter.js"],
    "oxc-ts": ["setter.js"],
    yuku: ["constructor.js", "method.js", "setter.js"],
    "yuku-ts": ["setter.js"],
    hermes: ["constructor.js", "method.js", "setter.js"],
    "babel-ts": ["constructor.js", "method.js", "setter.js"],
    __babel_estree: ["constructor.js", "method.js", "setter.js"],
  },
});
