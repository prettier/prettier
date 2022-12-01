const errors = {
  flow: ["static.js"],
  meriyah: ["static.js"],
};

run_spec(__dirname, ["babel", "flow", "typescript"], { errors });
run_spec(__dirname, ["babel", "flow", "typescript"], { errors, semi: false });
