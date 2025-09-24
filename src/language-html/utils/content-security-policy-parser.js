// Copied from https://github.com/helmetjs/content-security-policy-parser/blob/main/mod.ts

const ASCII_WHITESPACE_CHARS = "\t\n\f\r ";
const ASCII_WHITESPACE = new RegExp(`[${ASCII_WHITESPACE_CHARS}]+`, "u");
const ASCII_WHITESPACE_AT_START = new RegExp(
  `^[${ASCII_WHITESPACE_CHARS}]+`,
  "u",
);
const ASCII_WHITESPACE_AT_END = new RegExp(
  `[${ASCII_WHITESPACE_CHARS}]+$`,
  "u",
);

// eslint-disable-next-line no-control-regex
const ASCII = /^[\x00-\x7f]*$/u;

/**
 * Parse a serialized Content Security Policy.
 * https://w3c.github.io/webappsec-csp/#parse-serialized-policy
 */
export default function parseContentSecurityPolicy(policy) {
  const result = [];

  // "For each token returned by strictly splitting serialized on the
  // U+003B SEMICOLON character (;):"
  for (let token of policy.split(";")) {
    // "1. Strip leading and trailing ASCII whitespace from token."
    token = token
      .replace(ASCII_WHITESPACE_AT_START, "")
      .replace(ASCII_WHITESPACE_AT_END, "");

    // "2. If token is an empty string, or if token is not an ASCII string,
    //     continue."
    if (!token || !ASCII.test(token)) {
      // Don't continue on invalid CSP, throw instead
      throw new Error("Invalid CSP policy");
    }

    // We do these at the same time:
    // "3. Let directive name be the result of collecting a sequence of
    //     code points from token which are not ASCII whitespace."
    // "6. Let directive value be the result of splitting token on
    //     ASCII whitespace."
    const [rawDirectiveName, ...directiveValue] = token.split(ASCII_WHITESPACE);
    // "4. Set directive name to be the result of running ASCII lowercase on
    //     directive name."
    const directiveName = rawDirectiveName.toLowerCase();

    // Store it though directive name is already present
    // Prettier shouldn't remove duplicate directives
    result.push({ name: directiveName, value: directiveValue });
  }

  return result;
}
