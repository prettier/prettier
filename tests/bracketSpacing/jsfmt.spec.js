run_spec(__dirname);
run_spec(__dirname, { bracketSpacing: false });

run_spec(__dirname, {parser: 'typescript'});
run_spec(__dirname, { parser: 'typescript', bracketSpacing: false });