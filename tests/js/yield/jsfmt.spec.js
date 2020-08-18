run_spec(__dirname, ["babel", "typescript"], {
  errors: { espree: ["jsx-without-parenthesis.js"] },
});
