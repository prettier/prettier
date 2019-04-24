run_spec(__dirname, ["html"]);
run_spec(__dirname, ["html"], { printWidth: 1 });
run_spec(__dirname, ["html"], { printWidth: Infinity });
run_spec(__dirname, ["html"], { htmlWhitespaceSensitivity: "strict" });
run_spec(__dirname, ["html"], { htmlWhitespaceSensitivity: "ignore" });
run_spec(__dirname, ["html"], { htmlTopLevelIndent: "always" });
run_spec(__dirname, ["html"], { htmlTopLevelIndent: "never" });
