run_spec(__dirname, ["babel", "flow", "typescript"], {
  plugins: ["./tests/integration/plugins/sql/main.js"],
});
