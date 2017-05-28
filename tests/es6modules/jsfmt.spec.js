run_spec(__dirname);
// FIXME export_default_function_declaration_async.js flow != babylon output
run_spec(__dirname, { parser: "babylon" }, ["typescript"]);
