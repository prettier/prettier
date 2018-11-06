run_spec(__dirname, ["markdown"]);
run_spec(__dirname, ["markdown"], { endOfLine: "cr" });
run_spec(__dirname, ["markdown"], { endOfLine: "crlf" });
run_spec(__dirname, ["markdown"], { endOfLine: "lf" });
