runFormatTest(import.meta, ["mdx"]);
runFormatTest(import.meta, ["mdx"], { semi: false });
runFormatTest(import.meta, ["mdx"], { proseWrap: "always" });
runFormatTest(import.meta, ["mdx"], { proseWrap: "never" });
