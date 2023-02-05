import * as prettier from "../../../../src/index";

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

prettier.format("pluginSearchDir is empty", {
  pluginSearchDirs: [],
});

prettier.format("pluginSearchDir is not empty", {
  pluginSearchDirs: ["/a", "/b"],
});

prettier.format("pluginSearchDir is not empty and mixed with weird stuff", {
  pluginSearchDirs: ["c", "d", ""],
});

prettier.format("pluginSearchDir is false", {
  pluginSearchDirs: false,
});

prettier.format("pluginSearchDir can not be true", {
  // @ts-expect-error
  pluginSearchDirs: true,
});

prettier.format("singleAttributePerLine is available", {
  singleAttributePerLine: true,
});
