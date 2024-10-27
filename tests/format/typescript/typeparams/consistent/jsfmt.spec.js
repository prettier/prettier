run_spec(__dirname, ["typescript", "flow", "babel-flow"], {
  errors: {
    flow: ["template-literal-types.ts"],
    "babel-flow": ["template-literal-types.ts"],
  },
});
