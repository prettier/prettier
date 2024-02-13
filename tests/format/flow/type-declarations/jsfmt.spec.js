runFormatTest(import.meta, ["flow"], {
  errors: {
    "babel-flow": ["declare_namespace.js"],
  },
});
runFormatTest(import.meta, ["flow"], {
  semi: false,
  errors: {
    "babel-flow": ["declare_namespace.js"],
  },
});
