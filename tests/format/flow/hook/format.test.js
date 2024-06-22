runFormatTest(import.meta, ["flow"], {
  errors: {
    "babel-flow": [
      "declare-hook.js",
      "hook-declaration.js",
      "hook-type-annotation.js",
    ],
  },
});
