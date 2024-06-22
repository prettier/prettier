const errors = {
  acorn: ["quoted-keys.js"],
  espree: ["quoted-keys.js"],
  meriyah: ["quoted-keys.js"],
};
runFormatTest(import.meta, ["babel", "typescript"], { errors });
runFormatTest(import.meta, ["babel", "typescript"], {
  quoteProps: "consistent",
  errors,
});
runFormatTest(import.meta, ["babel", "typescript"], {
  quoteProps: "preserve",
  errors,
});
