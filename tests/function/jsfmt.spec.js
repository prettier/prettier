run_spec(__dirname);
run_spec(__dirname, { noSpaceEmptyFn: true });
run_spec(__dirname, { parser: 'typescript' });
run_spec(__dirname, { noSpaceEmptyFn: true, parser: 'typescript' });
