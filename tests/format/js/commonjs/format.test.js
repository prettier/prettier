const tests = [
  {
    code: "return",
    baseFilename: "return",
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
  [".js", ".cjs", ".mjs"].map((extension) => {
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
      espree: ["return.mjs", "new-target.mjs"],
      meriyah: ["using.cjs", "return.mjs", "new-target.mjs"],
      flow: [
        "new-target.cjs",
        "new-target.mjs",
        "new-target.js",
        "using.cjs",
        "using.mjs",
        "using.js",
      ],
      hermes: ["new-target.cjs", "new-target.mjs", "new-target.js"],
      oxc: ["new-target.mjs"],
      "oxc-ts": ["new-target.mjs"],
      yuku: ["return.mjs"],
      "yuku-ts": ["return.mjs"],
    },
  },
);
