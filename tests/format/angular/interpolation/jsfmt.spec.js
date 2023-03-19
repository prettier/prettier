// We always pass {trailingComma: "none"} when printing
run_spec(import.meta, ["__ng_interpolation"], { trailingComma: "none" });
run_spec(import.meta, ["__ng_interpolation"], {
  experimentalOperatorPosition: true,
  trailingComma: "none",
});
