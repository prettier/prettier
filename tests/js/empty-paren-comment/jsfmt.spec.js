run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: { espree: ["class-property.js"] },
});
