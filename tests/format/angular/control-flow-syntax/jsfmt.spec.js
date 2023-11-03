const errors = {
  angular: [
    "invalid-for-block-empty-with-param.html",
    "invalid-for-block-multiple-empty-blocks.html",
    "invalid-defer-block-multiple-placeholder-blocks.html",
    "invalid-defer-block-multiple-loading-blocks.html",
    "invalid-defer-block-multiple-error-blocks.html",
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
