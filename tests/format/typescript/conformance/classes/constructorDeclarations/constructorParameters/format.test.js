runFormatTest(import.meta, ["typescript"], {
  errors: {
    "babel-ts": ["readonlyInConstructorParameters.ts", "readonlyReadonly.ts"],
  },
});
