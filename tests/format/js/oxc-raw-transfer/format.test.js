runFormatTest(import.meta, ["oxc", "oxc-ts"], {
  oxcRawTransferMode: false,
});

runFormatTest(import.meta, ["oxc", "oxc-ts"], {
  oxcRawTransferMode: true,
});
