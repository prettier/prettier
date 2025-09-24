/*
Based on https://github.com/helmetjs/content-security-policy-parser/blob/main/mod.ts with modifications:

1. Emit policy list instead of a `Map`, so we won't remove duplicated features.
1. Skip ASCII check, so we won't remove invalid features.
1. Skip directive name normalization, so we won't modify original casing.
*/
import htmlWhitespaceUtils from "../../utils/html-whitespace-utils.js";

/**
 * Parse a serialized Content Security Policy.
 * https://w3c.github.io/webappsec-csp/#parse-serialized-policy
 */
function parsePermissionsPolicy(policy) {
  const policies = [];

  // "For each token returned by strictly splitting serialized on the
  // U+003B SEMICOLON character (;):"
  for (let token of policy.split(";")) {
    // "1. Strip leading and trailing ASCII whitespace from token."
    token = htmlWhitespaceUtils.trim(token);

    // "2. If token is an empty string, or if token is not an ASCII string,
    //     continue."
    // Prettier: Skipped ASCII check.
    if (!token) {
      continue;
    }

    // We do these at the same time:
    // "3. Let directive name be the result of collecting a sequence of
    //     code points from token which are not ASCII whitespace."
    // "6. Let directive value be the result of splitting token on
    //     ASCII whitespace."
    const [name, ...value] = htmlWhitespaceUtils.split(token);

    // "7. Let directive be a new directive whose name is directive name,
    //     and value is directive value."
    // Prettier: Skipped directive name normalization.
    policies.push({ name, value });
  }

  return policies;
}

export default parsePermissionsPolicy;
