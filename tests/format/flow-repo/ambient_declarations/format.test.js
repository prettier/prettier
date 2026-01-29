runFormatTest(import.meta, ["flow"], {
  errors: {
    hermes: [
      "components.js.flow",
      "component_namespace.js",
      "implicit_functions.js",
      "namespace.js",
      "variables.js.flow",
    ],
  },
});
