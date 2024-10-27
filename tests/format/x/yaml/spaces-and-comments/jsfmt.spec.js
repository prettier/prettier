// [prettierx] keep options in alphabetical order to keep stable snapshot
// when merging updates from Prettier 2.3.1
run_spec(__dirname, ["yaml"], { proseWrap: "always" });
run_spec(__dirname, ["yaml"], { useTabs: true });
