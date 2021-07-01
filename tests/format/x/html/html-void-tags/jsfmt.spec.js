// using bogus option to keep snapshot more consistent with prettierX 0.18.x
run_spec(__dirname, ["html", "angular"], { bogus: null });
run_spec(__dirname, ["html"], { htmlVoidTags: true });
run_spec(__dirname, ["angular"], { htmlVoidTags: true });
