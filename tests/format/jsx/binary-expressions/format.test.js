runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  errors: { flow: ["relational-operators.js"] },
});
