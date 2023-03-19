const errors = {
  acorn: ["non-octal-eight-and-nine.js"],
  espree: ["non-octal-eight-and-nine.js"],
};

run_spec(import.meta, ["babel", "flow"], {
  trailingComma: "es5",
  errors,
});
run_spec(import.meta, ["babel", "flow"], {
  trailingComma: "all",
  errors,
});
run_spec(import.meta, ["babel", "flow"], {
  trailingComma: "all",
  experimentalOperatorPosition: true,
  errors,
});
