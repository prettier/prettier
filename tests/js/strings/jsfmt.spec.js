run_spec(__dirname, ["babel", "flow"], {
  errors: { meriyah: ["non-octal-eight-and-nine.js"] },
});
run_spec(__dirname, ["babel", "flow"], {
  trailingComma: "all",
  errors: { meriyah: ["non-octal-eight-and-nine.js"] },
});
