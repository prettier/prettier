// Issue #17713: SVG text content should respect htmlWhitespaceSensitivity: strict
// https://github.com/prettier/prettier/issues/17713
//
// With strict mode, the interpolation content inside SVG elements should NOT be
// reformatted with extra whitespace. The tag may still break if it has attributes,
// but the content like {{ area.position }} should stay on one line.

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // Issue #17713: SVG text with interpolation - content should stay inline
      {
        name: "#17713 SVG text - interpolation content preserved",
        code: '<svg><text fill="#fff" x="10" y="20">{{ area.position }}</text></svg>',
      },
      {
        name: "#17713 SVG title - interpolation content preserved",
        code: "<svg><title>{{ title }}</title></svg>",
      },
      // Test with many attributes that would normally cause breaking
      {
        name: "#17713 SVG text many attrs - interpolation still inline",
        code: '<svg><text fill="#fff" alignment-baseline="middle" text-anchor="middle" x="10" y="20">{{ value }}</text></svg>',
      },
    ],
  },
  ["angular"],
  { htmlWhitespaceSensitivity: "strict" },
);
