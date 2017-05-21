run_spec(__dirname);
// FIXME arrow.js flow != babylon output
run_spec(__dirname, { parser: "babylon" });
