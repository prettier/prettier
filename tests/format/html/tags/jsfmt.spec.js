runFormatTest(import.meta, ["html"]);
runFormatTest(import.meta, ["html"], { printWidth: 1 });
runFormatTest(import.meta, ["html"], { printWidth: Number.POSITIVE_INFINITY });
runFormatTest(import.meta, ["html"], { htmlWhitespaceSensitivity: "strict" });
runFormatTest(import.meta, ["html"], { htmlWhitespaceSensitivity: "ignore" });
