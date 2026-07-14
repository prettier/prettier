runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    babel: true,
    flow: true,
    typescript: true,
    "babel-ts": true,
    hermes: true,
    __babel_estree: true,
  },
});
