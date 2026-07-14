const errors = { yuku: ["let.js"], "yuku-ts": ["let.js"] };

runFormatTest(
  import.meta,
  [
    "babel",
    //  "flow",
    "typescript",
  ],
  { errors },
);
runFormatTest(
  import.meta,
  [
    "babel",
    // "flow",
    "typescript",
  ],
  { semi: false, errors },
);
