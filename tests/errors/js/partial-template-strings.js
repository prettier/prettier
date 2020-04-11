// partial template strings is not supported by babel yet
// Proposal: https://github.com/tc39/proposal-partial-application/blob/master/README.md#proposal

const Diagnostics = {
  unexpected_token: `Unexpected token: ${?}`,
  name_not_found: `'${?}' not found.`
};
Diagnostics.name_not_found("foo"); // "'foo' not found."
