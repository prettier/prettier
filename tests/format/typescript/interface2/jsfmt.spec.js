run_spec(__dirname, ["typescript", "babel", "flow"], {
  errors: {
    babel: ["long-type-parameters.ts"],
    "__babel_estree": ["long-type-parameters.ts"],
    flow: ["long-type-parameters.ts"],
   },
});
