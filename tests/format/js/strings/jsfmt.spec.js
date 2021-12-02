run_spec(import.meta, ["babel", "flow"], {
  errors: { espree: ["non-octal-eight-and-nine.js"] },
});
run_spec(import.meta, ["babel", "flow"], {
  trailingComma: "all",
  errors: { espree: ["non-octal-eight-and-nine.js"] },
});
