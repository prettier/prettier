run_spec(import.meta, ["flow", "babel", "typescript"], {
  bracketSameLine: true,
  errors: {
    typescript: ["in-end-tag.tsx"],
    meriyah: ["in-end-tag.tsx", "fragment.js"],
  },
});
