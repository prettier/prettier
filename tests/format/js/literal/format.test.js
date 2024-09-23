// flow-parser@0.38.0 fails to parse `1.e1`, so use babel here.
runFormatTest(import.meta, ["babel", "typescript"]);
