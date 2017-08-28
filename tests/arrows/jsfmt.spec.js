run_spec(__dirname, { arrowFnParens: "avoid", parser: "babylon" }, [
  "typescript"
]);
run_spec(__dirname, { arrowFnParens: "functional", parser: "babylon" }, [
  "typescript"
]);
run_spec(__dirname, { arrowFnParens: "always", parser: "babylon" }, [
  "typescript"
]);
