const tests = [
  {
    code: "const foo: string;",
    baseFilename: "const-without-initializer",
  },
].flatMap(({ code, baseFilename }) =>
  [undefined, ".js.flow", ".unknown"].map((extension) => {
    const filename =
      extension === undefined ? undefined : `${baseFilename}${extension}`;
    return {
      name: filename ?? `${baseFilename} (undefined filename)`,
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
