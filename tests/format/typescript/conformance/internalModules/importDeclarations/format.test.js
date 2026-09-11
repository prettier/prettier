runFormatTest(import.meta, ["typescript"], {
  errors: {
    "babel-ts": [
      "circularImportAlias.ts",
      "exportImportAlias.ts",
      "importAliasIdentifiers.ts",
      "shadowedInternalModule.ts",
    ],
  },
});
