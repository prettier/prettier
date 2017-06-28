// @flow

var React = require('react');

class CustomComponent extends React.Component {
  props: {
    prop: string
  };
}

var a: React$Node<{prop: string}> = <CustomComponent prop="asdf" />;
var b: React$Node<{prop1: string}> = <CustomComponent prop="asdf" />; // Error: Props<{prop}> ~> Props<{prop1}>

<div id="asdf" />;
<div id={42} />; // Error: (`id` prop) number ~> string
var c: React$Node<{id: string}> = <div id="asdf" />;
var d: React$Node<{id: number}> = <div id="asdf" />; // Error: Props<{id:string}> ~> Props<{id:number}>
