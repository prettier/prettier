run_spec(import.meta, ["flow"], {
  quoteProps: "as-needed",
});

run_spec(import.meta, ["flow"], {
  quoteProps: "preserve",
});

run_spec(import.meta, ["flow"], {
  quoteProps: "consistent",
});

run_spec(import.meta, ["flow"], {
  quoteProps: "consistent",
  singleQuote: true,
});
