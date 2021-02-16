const errors = {
  espree: ["sibling-private-function-object-members.js"],
  flow: ["sibling-private-function-object-members.js"],
};

run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], { errors });
