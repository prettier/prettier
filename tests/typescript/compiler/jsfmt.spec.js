run_spec(__dirname, ["typescript"], {
  errors: {
    "babel-ts": [
      "downlevelLetConst1.ts",
      "errorOnInitializerInInterfaceProperty.ts",
      "modifiersOnInterfaceIndexSignature1.ts",
    ],
  },
});
