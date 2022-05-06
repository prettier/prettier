run_spec(import.meta, ["typescript"], {
  errors: {
    "babel-ts": [
      "downlevelLetConst1.ts",
      "errorOnInitializerInInterfaceProperty.ts",
      "decrementAndIncrementOperators.ts",
    ],
  },
});
