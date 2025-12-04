runFormatTest(import.meta, ["flow"], {
  errors: { hermes: ["mobx.js", "comments.js"] },
});
