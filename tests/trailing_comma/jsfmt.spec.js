run_spec(__dirname);
run_spec(__dirname, { trailingComma: "all" });
run_spec(__dirname, { trailingComma: "es5" });
// 
run_spec(__dirname, {parser: 'typescript'});
run_spec(__dirname, { parser: 'typescript', trailingComma: "all" });
run_spec(__dirname, { parser: 'typescript', trailingComma: "es5" });
