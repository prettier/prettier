// @flow

type X<T: number> = bool;
(true: X<string>);
