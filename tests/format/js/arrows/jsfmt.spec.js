const errors = {
  acorn: ["tuple-and-record.js"],
  espree: ["tuple-and-record.js"],
  meriyah: ["tuple-and-record.js"],
  typescript: ["tuple-and-record.js"],
  flow: ["tuple-and-record.js"],
};
run_spec(import.meta, ["babel", "typescript"], {
  arrowParens: "always",
  errors,
});
run_spec(import.meta, ["babel", "typescript"], {
  arrowParens: "avoid",
  errors,
});
