run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["assertions.js"],
    typescript: ["assertions.js"],
    espree: ["assertions.js"],
    meriyah: ["assertions.js"],
    // [prettierx] test error(s) with __typescript_estree parser option
    __typescript_estree: ["assertions.js"],
  },
});
