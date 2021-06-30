run_spec(__dirname, ["babel", "flow", "typescript"], {
  // [prettierx] test error(s) with __typescript_estree parser option
  errors: {
    espree: true,
    flow: true,
    typescript: true,
    meriyah: true,
    __typescript_estree: true,
  },
});
