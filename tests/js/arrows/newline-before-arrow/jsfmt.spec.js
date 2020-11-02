run_spec(__dirname, ["babel"], {
  errors: { espree: ["newline-before-arrow.js"] },
});
