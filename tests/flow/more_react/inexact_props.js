//@flow

const React = require('react');

type Props1 = {
    +x : number;
    y : string;
}

type Props2 = {|
    +x : number;
    y : string;
|}

class A extends React$Component<Props1> {}
class B extends React$Component<Props2> {}

<A x={4} y={"hello"} z={3}></A>;
<B x={4} y={"hello"} z={3}></B>; // error


type Props3 = { p1? : boolean, p2? : number }

class XComponent<XProps : Props3, XState> extends React.PureComponent<
  XProps,
  XState
> {}

declare var cond : boolean;
const BaseComponent = cond ? React.Component : XComponent;

type Props4 = $Exact<{
  p1? : boolean,
  p2? : number,
  p3? : string,
}>;

class YComponent extends BaseComponent<Props4, void> {
  props : Props4;
}

declare var s : ?string;

<YComponent p1={true} p2={3} p3={s}></YComponent>
