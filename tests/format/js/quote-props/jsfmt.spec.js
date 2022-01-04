const errors = {};

run_spec(import.meta, ["babel"], {
  quoteProps: "as-needed",
  errors,
});

run_spec(import.meta, ["babel"], {
  quoteProps: "preserve",
  errors,
});

run_spec(import.meta, ["babel"], {
  quoteProps: "consistent",
  errors,
});

run_spec(import.meta, ["babel"], {
  quoteProps: "consistent",
  singleQuote: true,
  errors,
});
