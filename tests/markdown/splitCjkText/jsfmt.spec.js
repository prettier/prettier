run_spec(__dirname, ["markdown"]);
run_spec(__dirname, ["markdown"], { proseWrap: "always" });
run_spec(__dirname, ["markdown"], { insertCjSpacing: false });
run_spec(__dirname, ["markdown"], {
  proseWrap: "always",
  insertCjSpacing: false,
});
run_spec(__dirname, ["markdown"], {
  proseWrap: "never",
  insertCjSpacing: false,
});
