run_spec(__dirname, ["babel"], {
  errors: {
    babel: true,
    __babel_estree: true,
    espree: true,
    meriyah: true,
  },
});
