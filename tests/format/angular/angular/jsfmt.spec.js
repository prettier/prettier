run_spec(__dirname, ["angular"], { trailingComma: "none" });
run_spec(__dirname, ["angular"]);
run_spec(__dirname, ["angular"], { printWidth: 1 });
run_spec(__dirname, ["angular"], { htmlWhitespaceSensitivity: "ignore" });
run_spec(__dirname, ["angular"], {
  // [prettierx] bogus option to keep snapshot more consistent with Prettier 2.3.1
  bogus: null,
  // [prettierx] updated option:
  objectCurlySpacing: false,
});
