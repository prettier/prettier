runFormatTest(import.meta, ["typescript"], {
  errors: {
    "babel-ts": ["abstractProperties.ts", "abstractPropertiesWithBreaks.ts"],
  },
});
