run_spec(__dirname, ["babel"], {
  errors: {
    espree: true,
    meriyah: true,
    // https://github.com/babel/babel/issues/14037
    __babel_estree: ["module-string-names-export.js"],
  },
});
