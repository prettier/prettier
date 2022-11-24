run_spec(
  {
    dirname: __dirname,
    snippets: ["class interface {}", 'import interface from "foo";'],
  },
  ["espree", "meriyah"]
);
