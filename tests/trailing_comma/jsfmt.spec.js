run_spec(__dirname, null, ["typescript", "typescriptBabylon"]);
run_spec(__dirname, { trailingComma: "all" }, [
  "typescript",
  "typescriptBabylon"
]);
run_spec(__dirname, { trailingComma: "es5" }, [
  "typescript",
  "typescriptBabylon"
]);
