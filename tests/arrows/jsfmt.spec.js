run_spec(__dirname, { parser: "babylon", arrowParens: "avoid" }, [
  "typescript"
]);
run_spec(__dirname, { parser: "babylon", arrowParens: "always" }, [
  "typescript"
]);
