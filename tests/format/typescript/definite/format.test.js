runFormatTest(import.meta, ["babel-ts"], {
  errors: { typescript: ["asi.ts", "definite.ts", "without-annotation.ts"] },
});
