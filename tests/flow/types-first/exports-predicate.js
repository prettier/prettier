// @flow

function isStringNullOrEmpty(str: ?string): boolean %checks {
  return str == null || str === "";
}

declare function declaredIsStringNullOrEmpty(
  str: ?string
): boolean %checks(str == null || str === "");

module.exports = {
  isStringNullOrEmpty,
  declaredIsStringNullOrEmpty
};
