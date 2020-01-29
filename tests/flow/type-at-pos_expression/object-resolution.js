// @flow

type O = {|p: number|};
declare var ro: $ReadOnly<O>;
(ro.p: number);

type O1 = {p: number};
type O2 = {p: number; q: string};
declare var diff: $Diff<O2, O1>;
(diff.q: string);

declare var spread: { ...O2 };
if (spread.q) (spread.q: string);
