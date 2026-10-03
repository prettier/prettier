runFormatTest(
  import.meta,
  [
    "markdown",
    // `mdx` doesn't support indented code
    // "mdx",
  ],
  { tabWidth: 4 },
);
