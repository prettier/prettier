// TODO: `meriyah` don't support BigInt as key
const errors = { espree: ["classes.js"], meriyah: ["numeric-separator.js", "objects.js"] };

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
