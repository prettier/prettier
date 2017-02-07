run_spec(__dirname);

run_spec(__dirname, { trailingComma: true });

run_spec(__dirname, {
  trailingComma: true,
  trailingCommaImports: true,
  trailingCommaExports: true,
  trailingCommaArgs: true
});
