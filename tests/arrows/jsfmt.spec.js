run_spec(__dirname, { arrowFnParens: "avoid", parser: "babylon" }, [
  "typescript"
]);
run_spec(__dirname, { arrowFnParens: "default", parser: "babylon" }, [
  "typescript"
]);
run_spec(__dirname, { arrowFnParens: "always", parser: "babylon" }, [
  "typescript"
]);
