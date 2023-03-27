run_spec(import.meta, ["html"]);
run_spec(import.meta, ["html"], { printWidth: 1 });
run_spec(import.meta, ["html"], { printWidth: Number.POSITIVE_INFINITY });
run_spec(import.meta, ["html"], { htmlWhitespaceSensitivity: "strict" });
run_spec(import.meta, ["html"], { htmlWhitespaceSensitivity: "ignore" });
