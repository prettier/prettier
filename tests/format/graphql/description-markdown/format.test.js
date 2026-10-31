runFormatTest(import.meta, ["graphql"]);
runFormatTest(import.meta, ["graphql"], { embeddedLanguageFormatting: "off" });
runFormatTest(import.meta, ["graphql"], {
  printWidth: 40,
  proseWrap: "always",
});
