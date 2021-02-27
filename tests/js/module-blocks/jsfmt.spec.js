run_spec(__dirname, ["babel"], {
  errors: { espree: ["module-blocks.js"], meriyah: ["module-blocks.js"] },
});
