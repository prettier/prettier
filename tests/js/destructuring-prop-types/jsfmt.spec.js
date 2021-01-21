const errors = {
  espree: ["prop-types.js"],
  meriyah: ["prop-types.js"],
};

run_spec(__dirname, ["babel", "babel-flow", "flow"], { errors });

// different output when using TypeScript parsers
run_spec(__dirname, ["babel-ts", "typescript"]);
