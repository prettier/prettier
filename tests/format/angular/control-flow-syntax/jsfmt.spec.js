const errors = {
  angular: [
    "invalid-multiple-empty-blocks-in-for.html",
    "invalid-empty-with-param-in-for.html",
  ],
};

run_spec(import.meta, ["angular"], {
  bracketSameLine: true,
  errors,
});
run_spec(import.meta, ["angular"], {
  bracketSameLine: false,
  errors,
});
