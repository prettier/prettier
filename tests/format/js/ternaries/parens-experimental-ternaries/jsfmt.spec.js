run_spec(
  {
    ...import.meta,
    url: new URL("../parens/jsfmt.spec.js", import.meta.url).href,
  },
  ["babel", "flow", "typescript"],
  {
    experimentalTernaries: true,
  },
);
