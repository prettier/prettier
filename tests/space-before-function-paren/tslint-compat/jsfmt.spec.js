run_spec(__dirname, ["typescript"], { spaceBeforeFunctionParen: true });

run_spec(__dirname, ["typescript"]);

run_spec(__dirname, ["typescript"], {
  spaceBeforeFunctionParen: true,
  parenSpacing: true
});

run_spec(__dirname, ["typescript"], {
  parenSpacing: true
});
