/**
 * Adapted from https://github.com/eslint/eslint/blob/de0b4ad7bd820ade41b1f606008bea68683dc11a/lib/rules/no-useless-escape.js#L27
 */
const validStringEscapeRegex = /^[^\n\r"'0-7\\bfnrt-vx\u2028\u2029]$/u;

export default validStringEscapeRegex;
