run_spec(__dirname, ["html", "angular", "vue"]);
run_spec(__dirname, ["html"], { htmlVoidTags: true });
run_spec(__dirname, ["angular", "vue"], { htmlVoidTags: true });
