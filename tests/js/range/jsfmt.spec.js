run_spec(
  {
    dirname: __dirname,
    snippets: [
      {
        name: "#4206 FIXME",
        code: "export default class Foo{\n/**/\n}",
        rangeStart: 16,
        rangeEnd: 31,
      },
    ],
  },
  ["babel", "flow", "typescript"]
);
