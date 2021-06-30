run_spec(__dirname, ["babel", "typescript"], {
  errors: {
    espree: ["expression.js"],
    typescript: ["expression.js"],
    meriyah: ["expression.js"],
    // [prettierx] test error(s) with __typescript_estree parser option
    __typescript_estree: ["expression.js"],
  },
});
