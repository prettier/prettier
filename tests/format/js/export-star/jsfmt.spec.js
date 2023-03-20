run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: {
    flow: [
      "export-star-as-default.js",
      "export-star-as-string.js",
      "export-star-as-string2.js",
      "export-star-as-reserved-word.js",
    ],
    typescript: ["export-star-as-string.js", "export-star-as-string2.js"],
  },
});
