//@flow

// React.Element(Type) was behaving differently from React$Element(Type) due to a mishandled
// type destructor case. This tests that the logic stays correct, as all 8 of these should correctly
// typecheck.
const React = require('react');
class Component extends React.Component<{}> {};

declare var a : React.Element<Class<Component>>;
(a : React.Element<React.ElementType>);

const b = <Component/>;
(b: React.Element<React.ElementType>);

declare var c : React.Element<Class<Component>>;
(c : React.Element<React$ElementType>);

const d = <Component/>;
(d: React.Element<React$ElementType>);

declare var e : React.Element<Class<Component>>;
(d : React$Element<React$ElementType>);

const f = <Component/>;
(f: React$Element<React$ElementType>);

declare var g : React.Element<Class<Component>>;
(g : React$Element<React.ElementType>);

const h = <Component/>;
(h: React$Element<React.ElementType>);
