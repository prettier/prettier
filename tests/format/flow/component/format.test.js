runFormatTest(import.meta, ["flow"], {
  errors: {
    "babel-flow": [
      "component-declaration.js",
      "component-type-annotation.js",
      "declare-component.js",
    ],
  },
});
