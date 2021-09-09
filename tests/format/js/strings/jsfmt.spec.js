run_spec(__dirname, ["babel", "flow"], {
  trailingComma: "es5",
  errors: { espree: ["non-octal-eight-and-nine.js"] },
});
run_spec(__dirname, ["babel", "flow"], {
  trailingComma: "all",
  errors: { espree: ["non-octal-eight-and-nine.js"] },
});
