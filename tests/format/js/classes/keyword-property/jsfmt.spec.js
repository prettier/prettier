const errors = {
  flow: ["static.js"],
  // TODO: Remove this when fixing https://github.com/prettier/prettier/pull/13927
  meriyah: ["static.js"],
};

run_spec(__dirname, ["babel", "flow", "typescript"], { errors });
run_spec(__dirname, ["babel", "flow", "typescript"], { errors, semi: false });
