/**
 * @param {any} options
 * @param {("es5" | "all")} [level]
 * @returns {boolean}
 */
function shouldPrintComma(options, level = "es5") {
  return (
    (options.trailingComma === "es5" && level === "es5") ||
    (options.trailingComma === "all" && (level === "all" || level === "es5"))
  );
}

export { shouldPrintComma };
