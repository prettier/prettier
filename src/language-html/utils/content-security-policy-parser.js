// Copied from https://github.com/helmetjs/content-security-policy-parser/blob/main/mod.ts
import htmlWhitespaceUtils from "../../utils/html-whitespace-utils.js";

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
    token = htmlWhitespaceUtils.trim(token);

    // "2. If token is an empty string, or if token is not an ASCII string,
    //     continue."
    if (!token || !ASCII.test(token)) {
      continue;
    }

    // We do these at the same time:
    // "3. Let directive name be the result of collecting a sequence of
    //     code points from token which are not ASCII whitespace."
    // "6. Let directive value be the result of splitting token on
    //     ASCII whitespace."
    const [rawDirectiveName, ...directiveValue] = htmlWhitespaceUtils.split(token);
    // "4. Set directive name to be the result of running ASCII lowercase on
    //     directive name."
    const directiveName = rawDirectiveName.toLowerCase();

    // Store it though directive name is already present
    // Prettier shouldn't remove duplicate directives
    result.push({ name: directiveName, value: directiveValue });
  }

  return result;
}
