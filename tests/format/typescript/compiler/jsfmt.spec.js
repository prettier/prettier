run_spec(__dirname, ["typescript"], {
  errors: {
    "babel-ts": [
      "downlevelLetConst1.ts",
      "errorOnInitializerInInterfaceProperty.ts",
      "decrementAndIncrementOperators.ts",
    ],
  },
});
