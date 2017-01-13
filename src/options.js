var defaults = {
  // Number of spaces the pretty-printer should use per tab
  tabWidth: 2,
  // Fit code within this line limit
  printWidth: 80,
  // If true, will use single instead of double quotes
  singleQuote: false,
  // Controls the printing of trailing commas wherever possible
  trailingComma: false,
  // Controls the printing of spaces inside array and objects
  bracketSpacing: true
};

// Copy options and fill in default values.
exports.normalize = function(options) {
  const normalized = Object.assign({}, options);
  Object.keys(defaults).forEach(k => {
    if (normalized[k] == null) {
      normalized[k] = defaults[k];
    }
  });
  return normalized;
};
