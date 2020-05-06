// @flow

declare function foo(): void;
export default foo(); // sig. verification error - file is whitelisted
