run_spec(
  {
    dirname: __dirname,
    snippets: [
      "#{a() {}}",
      "#{async b() {}}",
      "#{get c() {}}",
      "#{set d(_) {}}",
      "#{*e() {}}",
    ],
  },
  ["babel", "espree", "meriyah"]
);
