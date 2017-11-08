export default {
  onwarn: function(warning) {
    if (
      [
        "EVAL",
        "MISSING_GLOBAL_NAME",
        "MISSING_NODE_BUILTINS",
        "UNRESOLVED_IMPORT"
      ].find(code => code === warning.code)
    ) {
      return;
    }

    console.warn(warning.message);
  }
};
