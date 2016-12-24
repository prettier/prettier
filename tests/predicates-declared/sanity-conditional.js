// @flow

// ERROR: only allow conditional expressions in `%checks`

declare function foo(x: string): mixed %checks(x = "1");
