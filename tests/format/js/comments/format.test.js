const fixtures = {
  importMeta: import.meta,
  snippets: [
    "var a = { /* comment */      \nb };", // trailing whitespace after comment
    "var a = { /* comment */\nb };",
  ],
};

const errors = {
  acorn: ["tuple-and-record.js"],
  espree: ["tuple-and-record.js"],
  meriyah: ["tuple-and-record.js"],
  typescript: ["tuple-and-record.js"],
  flow: ["tuple-and-record.js"],
};

runFormatTest(fixtures, ["babel", "flow", "typescript"], { errors });
runFormatTest(fixtures, ["babel", "flow", "typescript"], {
  semi: false,
  errors,
});
