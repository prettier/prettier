const tests = [
  {
    code: "return",
    baseFilename: "return/top-level",
  },
  // https://github.com/acornjs/acorn/issues/1376#issuecomment-2960924476
  {
    code: "class X { static { return; } }",
    baseFilename: "return/in-static-block",
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
      babel: [
        "return/in-static-block.cjs",
        "return/in-static-block.mjs",
        "return/in-static-block.unknown",
      ],
      "babel-ts": [
        "return/in-static-block.cjs",
        "return/in-static-block.mjs",
        "return/in-static-block.unknown",
      ],
      __babel_estree: [
        "return/in-static-block.cjs",
        "return/in-static-block.mjs",
        "return/in-static-block.unknown",
      ],
      acorn: [
        "new-target.mjs",
        "return/in-static-block.cjs",
        "return/in-static-block.mjs",
        "return/in-static-block.unknown",
      ],
      espree: [
        "return/top-level.mjs",
        "new-target.mjs",
        "return/in-static-block.cjs",
        "return/in-static-block.mjs",
        "return/in-static-block.unknown",
      ],
      meriyah: [
        "using.cjs",
        "return/top-level.mjs",
        "new-target.mjs",
        "return/in-static-block.cjs",
        "return/in-static-block.mjs",
        "return/in-static-block.unknown",
      ],
      flow: [
        "new-target.cjs",
        "new-target.mjs",
        "new-target.unknown",
        "using.cjs",
        "using.mjs",
        "using.unknown",
      ],
      hermes: ["new-target.cjs", "new-target.mjs", "new-target.unknown"],
      oxc: [
        "new-target.mjs",
        "return/in-static-block.cjs",
        "return/in-static-block.mjs",
        "return/in-static-block.unknown",
      ],
      "oxc-ts": [
        "new-target.mjs",
        "return/in-static-block.cjs",
        "return/in-static-block.mjs",
        "return/in-static-block.unknown",
      ],
      yuku: [
        "return/top-level.mjs",
        "return/in-static-block.cjs",
        "return/in-static-block.mjs",
        "return/in-static-block.unknown",
      ],
      "yuku-ts": [
        "return/top-level.mjs",
        "return/in-static-block.cjs",
        "return/in-static-block.mjs",
        "return/in-static-block.unknown",
      ],
    },
  },
);
