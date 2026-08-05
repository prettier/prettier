runFormatTest(import.meta, ["mdx"]);
runFormatTest(import.meta, ["mdx"], { semi: false });
runFormatTest(import.meta, ["mdx"], { objectWrap: "preserve" });
runFormatTest(import.meta, ["mdx"], { embeddedLanguageFormatting: "off" });
