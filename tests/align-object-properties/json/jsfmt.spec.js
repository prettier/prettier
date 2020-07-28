run_spec(__dirname, ["json", "json-stringify"], {
  alignObjectProperties: true,
  trailingComma: "none" // ("Standard JS")
});
run_spec(__dirname, ["json5"], {
  alignObjectProperties: true,
  trailingComma: "none" // ("Standard JS")
});
