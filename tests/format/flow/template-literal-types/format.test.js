const errors = { hermes: ["template-literal-types.js"] };

runFormatTest(import.meta, ["flow"], { errors });

runFormatTest(import.meta, ["flow"], {
  arrowParens: "avoid",
  errors,
});
