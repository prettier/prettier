run_spec(__dirname);
run_spec(__dirname, { breakBeforeElse: true });
run_spec(__dirname, { parser: 'typescript' });
run_spec(__dirname, { breakBeforeElse: true, parser: 'typescript' });
