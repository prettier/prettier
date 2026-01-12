// `typescript` is the only parser supports `assertions`
// Remove it from "check-parsers.js" when we drop support for "import assertions"
runFormatTest(import.meta, ["typescript"], {
  bracketSpacing: false,
  errors: { "babel-ts": ["static-import.js", "re-export.js", "empty.js"] },
});
