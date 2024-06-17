const fixtures = {
  importMeta: import.meta,
  snippets: ["` \n `", "` \na  `"],
};

runFormatTest(fixtures, ["markdown"], { proseWrap: "preserve" });
runFormatTest(fixtures, ["markdown"], { proseWrap: "always" });
