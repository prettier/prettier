//@flow

const React = require('react');
const {useImperativeHandle} = React;

function Demo(props, ref) {
  useImperativeHandle(ref, () => ({
    moo(x: string) {},
  }));
  return null;
}

const Lazy = React.lazy(async () => ({
  default: React.forwardRef(Demo),
}));

function App() {
  // Error below: moo expects a string, given a number
  return (
    <React.Suspense fallback="Loading...">
      <Lazy ref={ref => ref && ref.moo(0)} />;
    </React.Suspense>
  );
}
