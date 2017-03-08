run_spec(__dirname);
run_spec(__dirname, { tabWidth: 4 });

run_spec(__dirname, {parser: 'typescript'});
run_spec(__dirname, { parser: 'typescript', tabWidth: 4 });