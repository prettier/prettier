run_spec(__dirname, ["typescript", "babel-ts"], {
  quoteProps: "as-needed",
});

run_spec(__dirname, ["typescript", "babel-ts"], {
  quoteProps: "preserve",
});

run_spec(__dirname, ["typescript", "babel-ts"], {
  quoteProps: "consistent",
});
