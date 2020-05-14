run_spec(__dirname, ["babel", "flow"], {
  quoteProps: "as-needed",
});

run_spec(__dirname, ["babel", "flow"], {
  quoteProps: "preserve",
});

run_spec(__dirname, ["babel", "flow"], {
  quoteProps: "consistent",
});
run_spec(__dirname, ["babel", "flow"], {
  quoteProps: "consistent",
  singleQuote: true,
});
