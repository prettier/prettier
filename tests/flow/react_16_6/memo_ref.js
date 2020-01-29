//@flow

const React = require('react');
const {useImperativeHandle} = React;

function Demo(props, ref) {
  useImperativeHandle(ref, () => ({
    moo(x: string) {},
  }));
  return null;
}

const Memo = React.memo(React.forwardRef(Demo));

function App() {
  // Error below: moo expects a string, given a number
  return <Memo ref={ref => ref && ref.moo(0)} />;
}
