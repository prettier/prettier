// @flow

declare opaque type Val;
declare var obj: { a: Val, b: Val };

module.exports = { ...obj };
