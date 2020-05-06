// @flow
const React = require('react');

type Props = $ReadOnly<{| bar: string, baz: number |}>;
declare var TestComponent: React.ComponentType<Props>;
const props: Props = {bar: '', baz: 0};

<TestComponent {...props} />; //breaks
({...props}: Props); //works
