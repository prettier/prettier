run_spec(__dirname, ["glimmer"], { printWidth: 40 });
run_spec(__dirname, ["glimmer"], {
  printWidth: 40,
  htmlWhitespaceSensitivity: "ignore",
});
run_spec(__dirname, ["glimmer"], {
  printWidth: 40,
  htmlWhitespaceSensitivity: "strict",
});
