runFormatTest(
  import.meta,
  ["flow"],
  // #13817 require those options to reproduce
  { arrowParens: "avoid", trailingComma: "all" },
);
