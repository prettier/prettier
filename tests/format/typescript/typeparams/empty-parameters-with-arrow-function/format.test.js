runFormatTest(
  import.meta,
  ["typescript", "flow"],
  // #13817 require those options to reproduce
  { arrowParens: "avoid", trailingComma: "all" },
);
