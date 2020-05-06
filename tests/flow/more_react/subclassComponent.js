//@#flow

var React = require("React");

type Props1 = {||}

declare class A extends React$Component<Props1, void> {}
declare class B extends A {}
declare class C extends B {}

<A></A>;
<B></B>;
<C></C>;

declare class React$Component2<Props, State = void> {
  props : Props;
}

type Props2 = {||}

declare class D extends React$Component2<Props2, void> {}

declare class E extends D {}

declare class F {
  props : {||}
}

<D></D>; // error
<E></E>; // error
<F></F>; // error
