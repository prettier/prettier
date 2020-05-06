//@flow

const React = require('react');

type Props = {| foo: number |};

function Component(x: Props): React.Node { return null }

const MemoComponent = React.memo(Component);

const _a = <MemoComponent foo={3} />;
const _b = <MemoComponent />; // Error missing foo
const _c = <MemoComponent foo={3} bar={3} />; // Error extra bar
const _d = <MemoComponent foo="string" />; // Error wrong type for foo

const MemoComponentWithEqual = React.memo(Component, (props1, props2) => props1 === props2);

const _e = <MemoComponentWithEqual foo={3} />;
const _f = <MemoComponentWithEqual />; // Error missing foo
const _g = <MemoComponentWithEqual foo={3} bar={3} />; // Error extra bar
const _h = <MemoComponentWithEqual foo="string" />; // Error wrong type for foo

const _i = React.memo(React.forwardRef(Component));
