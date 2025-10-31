runFormatTest(import.meta, ["typescript"], {
  errors: { typescript: ["3.ts", "5.tsx"], "oxc-ts": ["3.ts", "5.tsx"] },
});
