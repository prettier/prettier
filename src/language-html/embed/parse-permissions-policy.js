/*
Based on https://github.com/helmetjs/content-security-policy-parser/blob/main/mod.ts with modifications:

1. Emit policy list instead of a `Map`, so we won't remove duplicated directives.
1. Skip ASCII check, so we won't remove invalid directives.
1. Skip directive name normalization, so the printer can know what's the original name.
*/
import htmlWhitespace from "../../utilities/html-whitespace.js";

/**
@typedef {{
  name: string,
  value: string[],
}} Directive
*/

/**
Parse a serialized Content Security Policy.
https://w3c.github.io/webappsec-csp/#parse-serialized-policy

@param {string} policy
@returns {Directive[]}
*/
function parsePermissionsPolicy(policy) {
  const directives = [];

  // "For each token returned by strictly splitting serialized on the
  // U+003B SEMICOLON character (;):"
  for (let token of policy.split(";")) {
    // "1. Strip leading and trailing ASCII whitespace from token."
    token = htmlWhitespace.trim(token);

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
    const [name, ...value] = htmlWhitespace.split(token);

    // "4. Set directive name to be the result of running ASCII lowercase on
    //     directive name."
    // Prettier: Skipped directive name normalization.

    // "5. If policy's directive set contains a directive whose name is
    //     directive name, continue."
    // Prettier: We preserve duplicated directives.

    // "7. Let directive be a new directive whose name is directive name, and
    //     value is directive value."
    // "8. Append directive to policy's directive set."
    directives.push({ name, value });
  }

  return directives;
}

export default parsePermissionsPolicy;
