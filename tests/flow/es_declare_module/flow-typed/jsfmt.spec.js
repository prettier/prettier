run_spec(__dirname, ["flow"]);

// TODO: While the tests render the same, Flow is dropping the line breaks
// between each declaration while Babylon preserves them.
//run_spec(__dirname, null, ["babylon"]);
