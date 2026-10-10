runFormatTest(import.meta, ["typescript"], {
  errors: {
    "babel-ts": [
      "abstract-export.ts",
      "declare-export.ts",
      "default-export.ts",
      "nested-export.ts",
    ],
    "oxc-ts": [
      "abstract-export.ts",
      "declare-export.ts",
      "default-export.ts",
      "nested-export.ts",
    ],
    typescript: [
      "abstract-export.ts",
      "declare-export.ts",
      "default-export.ts",
      "nested-export.ts",
    ],
    "yuku-ts": [
      "abstract-export.ts",
      "declare-export.ts",
      "default-export.ts",
      "nested-export.ts",
    ],
  },
});
