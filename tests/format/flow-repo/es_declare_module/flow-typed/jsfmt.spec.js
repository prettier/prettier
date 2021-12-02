run_spec(import.meta, ["flow"]);

// TODO: While the tests render the same, Flow is dropping the line breaks
// between each declaration while babel preserves them.
//run_spec(import.meta, null, ["babel"]);
