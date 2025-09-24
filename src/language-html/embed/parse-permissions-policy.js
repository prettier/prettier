/*
Based on https://github.com/helmetjs/content-security-policy-parser/blob/main/mod.ts with modifications:

1. Emit policy list instead of a `Map`, so we won't remove duplicated features.
2. Skip ASCII check, so we won't remove invalid features.
3. Skip normalization, so we won't modify original casing.
*/
import htmlWhitespaceUtils from "../../utils/html-whitespace-utils.js";

/**
 * Parse a serialized Content Security Policy.
 * https://w3c.github.io/webappsec-csp/#parse-serialized-policy
 */
function parsePermissionsPolicy(policy) {
  const result = [];

  // "For each token returned by strictly splitting serialized on the
  // U+003B SEMICOLON character (;):"
  for (let token of policy.split(";")) {
    // "1. Strip leading and trailing ASCII whitespace from token."
    token = htmlWhitespaceUtils.trim(token);

    // "2. If token is an empty string, or if token is not an ASCII string,
    //     continue."
    if (!token) {
      continue;
    }

    // We do these at the same time:
    // "3. Let directive name be the result of collecting a sequence of
    //     code points from token which are not ASCII whitespace."
    // "6. Let directive value be the result of splitting token on
    //     ASCII whitespace."
    const [directiveName, ...directiveValue] = htmlWhitespaceUtils.split(token);

    result.push({ directive: directiveName, allowlist: directiveValue });
  }

  return result;
}

export default parsePermissionsPolicy;
