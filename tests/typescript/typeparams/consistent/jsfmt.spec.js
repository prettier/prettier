run_spec(__dirname, ["typescript", "flow", "babel-flow", "babel"], {
  errors: {
    flow: ["template-literal-types.ts"],
    "babel-flow": ["template-literal-types.ts"],
    babel: ["template-literal-types.ts"],
  },
});
