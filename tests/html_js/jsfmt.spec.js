run_spec(__dirname, ["html"]);
run_spec(__dirname, ["html"], { htmlTopLevelIndent: "auto" });
run_spec(__dirname, ["html"], { htmlTopLevelIndent: "always" });
run_spec(__dirname, ["html"], { htmlTopLevelIndent: "never" });
