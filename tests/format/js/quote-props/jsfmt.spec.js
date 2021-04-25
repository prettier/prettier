const errors = {
  espree: ["classes.js"],
};

run_spec(__dirname, ["babel"], {
  quoteProps: "as-needed",
  errors,
});

run_spec(__dirname, ["babel"], {
  quoteProps: "preserve",
  errors,
});

run_spec(__dirname, ["babel"], {
  quoteProps: "consistent",
  errors,
});

run_spec(__dirname, ["babel"], {
  quoteProps: "consistent",
  singleQuote: true,
  errors,
});
