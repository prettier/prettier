//@flow
const React = require('react');
function Component(): React$Node { return null; }

const _a = <Component foo={3} bar={3} />;
const _b = <Component>{"foo"}</Component>;
const _b2 = <Component></Component>;

type Props = {||}
function Component2(props : Props) : React$Node { return null; }

const _c = <Component2 foo={3} bar={3} />; // error
const _d = <Component2>{"foo"}</Component2>; //error

function Component3(props : { }) : React$Node { return null; }

const _e = <Component3 foo={3} bar={3} />;
const _f = <Component3>{"foo"}</Component3>;

function Component4(props : {| foo : number |}) : React$Node { return null; }

const _g = <Component4 foo={3} bar={3} />; //error
const _h = <Component4></Component4>; //error
