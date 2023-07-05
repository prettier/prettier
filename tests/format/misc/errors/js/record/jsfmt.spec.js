run_spec(
  {
    importMeta: import.meta,
    snippets: [
      "#{a() {}}",
      "#{async b() {}}",
      "#{get c() {}}",
      "#{set d(_) {}}",
      "#{*e() {}}",
    ],
  },
  ["babel", "acorn", "espree", "meriyah"],
);
