var React = require('react');

type T1 = { };
type T2 = { x: number };


class C1 extends React.Component<T1> { // OK
  static defaultProps: T2;
}

class C2 extends React.Component<T1> { // OK
}

// You need to add type arguments to React.Component
class C3 extends React.Component { // error
  static defaultProps: T1;
  props: T2;
}

class C4 extends React.Component {
  // no need to declare defaultProps unless necessary
  props: T2;
}
