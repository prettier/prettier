runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  errors: { hermes: ["edge-cases.jsx"] },
});
