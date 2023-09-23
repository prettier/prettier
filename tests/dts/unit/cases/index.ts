import * as prettier from "../../../../src/index.js";

prettier.format("foo ( );", { semi: false });
prettier.check("foo ( );", { semi: false });
prettier.formatWithCursor(" 1", { cursorOffset: 2 });
prettier.resolveConfig("path/to/somewhere").then((options) => {
  if (options !== null) {
    prettier.format("hello world", options);
  }
});
prettier.getFileInfo("./tsconfig.json").then((result) => {
  if (result.inferredParser !== "json") {
    throw new Error("Bad parser");
  }
});
// @ts-expect-error
prettier.resolveConfig();
prettier.resolveConfigFile().then((filePath) => {
  if (filePath !== null) {
    prettier.resolveConfig(filePath);
  }
});
prettier.resolveConfigFile("/path").then((filePath) => {
  if (filePath !== null) {
    prettier.resolveConfig(filePath);
  }
});
prettier.clearConfigCache();
prettier.getSupportInfo();

prettier.doc.builders.trim;
prettier.doc.builders.trim.type;
prettier.doc.builders.cursor;
prettier.doc.builders.cursor.type;
prettier.doc.builders.cursor.placeholder;

prettier.format("singleAttributePerLine is available", {
  singleAttributePerLine: true,
});
