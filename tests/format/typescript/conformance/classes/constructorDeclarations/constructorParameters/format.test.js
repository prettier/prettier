runFormatTest(import.meta, ["typescript"], {
  errors: {
    "babel-ts": [
      "readonlyInConstructorParameters.ts",
      "readonlyReadonly.ts",
      "constructorOverloadsWithDefaultValues.ts",
    ],
    "oxc-ts": ["readonlyInConstructorParameters.ts", "readonlyReadonly.ts"],
  },
});
