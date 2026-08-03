const tests = [
  {
    code: "return",
    baseFilename: "return-top-level",
  },
  {
    code: "new.target",
    baseFilename: "new-target",
  },
  {
    code: "using foo = bar",
    baseFilename: "using",
  },
].flatMap(({ code, baseFilename }) =>
  [".cjs", ".mjs", ".unknown"].map((extension) => {
    const filename = `${baseFilename}${extension}`;
    return { name: filename, code, filename };
  }),
);

runFormatTest(
  { importMeta: import.meta, snippets: tests },
  ["babel", "flow", "typescript"],
  {
    errors: {
      acorn: ["new-target.mjs"],
      espree: ["return-top-level.mjs", "new-target.mjs"],
      meriyah: ["using.cjs", "return-top-level.mjs", "new-target.mjs"],
      flow: [
        "new-target.cjs",
        "new-target.mjs",
        "new-target.unknown",
        "using.cjs",
        "using.mjs",
        "using.unknown",
      ],
      hermes: ["new-target.cjs", "new-target.mjs", "new-target.unknown"],
      oxc: ["new-target.mjs"],
      "oxc-ts": ["new-target.mjs"],
      yuku: ["return-top-level.mjs"],
      "yuku-ts": ["return-top-level.mjs"],
    },
  },
);
