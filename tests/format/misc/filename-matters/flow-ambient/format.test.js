const tests = [
  {
    code: "const foo: string;",
    baseFilename: "const-without-initializer",
  },
].flatMap(({ code, baseFilename }) =>
  [".js.flow", ".unknown", ".undefined"].map((extension) => {
    const filename = `${baseFilename}${extension}`;
    return {
      name: filename,
      code,
      filename,
    };
  }),
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: tests,
  },
  ["flow"],
  {
    errors: {
      flow: ["const-without-initializer.unknown"],
      hermes: true,
    },
  },
);
