run_spec(__dirname, ["flow", "babel"], {
  quoteProps: "as-needed"
});

run_spec(__dirname, ["flow", "babel"], {
  quoteProps: "preserve"
});

run_spec(__dirname, ["flow", "babel"], {
  quoteProps: "consistent"
});
run_spec(__dirname, ["flow", "babel"], {
  quoteProps: "consistent",
  singleQuote: true
});
