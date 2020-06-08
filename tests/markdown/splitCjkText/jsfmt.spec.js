run_spec(__dirname, ["markdown"]);
run_spec(__dirname, ["markdown"], { proseWrap: "always" });
run_spec(__dirname, ["markdown"], { cjkSpacing: "always" });
run_spec(__dirname, ["markdown"], {
  proseWrap: "always",
  cjkSpacing: "always",
});
