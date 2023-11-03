const errors = {
  angular: [
    "invalid-multiple-empty-blocks-in-for.html",
    "invalid-empty-with-param-in-for.html",
    "invalid-multiple-placeholder-blocks-in-defer.html",
    "invalid-multiple-loading-blocks-in-defer.html",
    "invalid-multiple-error-blocks-in-defer.html",
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
