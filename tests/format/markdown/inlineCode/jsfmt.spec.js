const fixtures = {
  importMeta: import.meta,
  snippets: ["` \n `"],
};

run_spec(fixtures, ["markdown"], { proseWrap: "preserve" });
run_spec(fixtures, ["markdown"], { proseWrap: "always" });
