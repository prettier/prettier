// @flow

const React = require('react');
import type {Element} from 'react';

class CustomComponent extends React.Component<{prop: string}, void> {}
class CustomComponentNope extends React.Component<{prop: string}, void> {}

var a: Element<typeof CustomComponent> =
  <CustomComponent prop="asdf" />;
var b: Element<typeof CustomComponentNope> =
  <CustomComponent prop="asdf" />; // Error: Bad class type
var c: Element<Class<React.Component<{prop1: string}, void>>> =
  <CustomComponent prop="asdf" />; // Error: Props<{prop}> ~> Props<{prop1}>

// Since intrinsics are typed as `any` out of the box, we can pass any
// attributes to intrinsics!
var d: Element<any> = <div not_a_real_attr="asdf" />;
// However, we don't allow such elements to be viewed as React elements with
// different component types.
var e: Element<'span'> = <div not_a_real_attr="asdf" />;
// No error as long as expectations are consistent, though.
var f: Element<'div'> = <div not_a_real_attr="asdf" />;
