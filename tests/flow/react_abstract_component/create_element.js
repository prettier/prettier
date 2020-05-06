//@flow

const React = require('react');

declare var C: React$AbstractComponent<{+foo?: number, +bar: number | string, +baz: number}, number>;

const _a = <C foo={3} bar="string" baz={4} />;
const _b = <C bar={3} baz={4} />;
const _c = <C baz={4} />; // Error missing bar
const _d = <C bar={3} />; // Error missing baz

const refGood = React.createRef<number>();
const _e = <C bar="string" baz={4} ref={refGood} />;

const refBad = React.createRef<string>();
const _f = <C bar="string" baz={4} ref={refBad} />; // Error bad ref

const _g = <C foo={3} bar="string" baz={4} key="test_ok" />;
const _h = <C foo={3} bar="string" baz={4} key={{bad: 3}} />; // Error bad key
