var defaults = {
  // Number of spaces the pretty-printer should use per tab for
  // indentation. If you do not pass this option explicitly, it will be
  // (quite reliably!) inferred from the original code.
  tabWidth: 2,

  // Fit code within this line limit.
  printWidth: 80,

  // If you want to override the quotes used in string literals, specify
  // either "single" or "double".
  quote: "double",

  // Controls the printing of trailing commas in object literals,
  // array expressions and function parameters.
  //
  // This option could either be:
  // * Boolean - enable/disable in all contexts (objects, arrays and function params).
  // * Object - enable/disable per context.
  //
  // Example:
  // trailingComma: {
  //   objects: true,
  //   arrays: true,
  //   parameters: false,
  // }
  trailingComma: false,

  // Controls the printing of spaces inside array and objects
  // See: http://eslint.org/docs/rules/array-bracket-spacing
  bracketSpacing: true
};

// Copy options and fill in default values.
exports.normalize = function(options) {
  const normalized = Object.assign({}, options);
  Object.keys(defaults).forEach(k => {
    if(normalized[k] == null) {
      normalized[k] = defaults[k];
    }
  });
  return normalized;
};
