const errors = {
  espree: ["prop-types.js"],
  meriyah: ["prop-types.js"],
};

run_spec(__dirname, ["babel", "babel-flow", "flow"], { errors });

// different output from `typescript` & `babel-ts` parsers
run_spec(__dirname, ["typescript"]);
