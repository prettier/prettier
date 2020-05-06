// @flow

type X = () => number;

declare var x1: ?X;
declare var x2: X;

(x1?.(): empty);
(x2?.(): empty)

declare var x3: ?(() => (() => number));
x3?.()();
(x3?.())();
