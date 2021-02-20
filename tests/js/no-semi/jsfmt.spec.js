const errors = { espree: ["class.js", "private-field.js"] };

run_spec(__dirname, ["babel", "flow"], { errors });
run_spec(__dirname, ["babel", "flow"], { semi: false, errors });
