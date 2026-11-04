runFormatTest(import.meta, ["typescript"], {
  errors: {
    typescript: ["filtered-namespaces.ts", "typescript-type-modifier.ts"],
    "oxc-ts": ["filtered-namespaces.ts", "typescript-type-modifier.ts"],
    "yuku-ts": ["filtered-namespaces.ts", "typescript-type-modifier.ts"],
    "babel-ts": ["typescript-type-modifier.ts"],
  },
});
