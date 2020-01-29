// @flow

import React from 'react';

class Foo extends React.Component<{}, void> {}
class Bar extends React.Component<{}, void> {}

{
  const stringValue: {current: string} = React.useRef("abc"); // Ok
  const numberValue: {current: number} = React.useRef(123); // Ok
  const booleanValue: {current: boolean} = React.useRef(true); // Ok
  const nullValue: {current: null} = React.useRef(null); // Ok
}

{
  const stringValue: {current: string | null} = React.useRef(123); // Error: number is incompatible with string in property current
  const numberValue: {current: number | null} = React.useRef("abc"); // Error: string is incompatible with number in property current
  const nullValue: {current: null} = React.useRef(true); // Error: boolean is incompatible with null in property current
}

{
  const stringValue: {current: string | null} = React.useRef(null);
  stringValue.current = "foo"; // Ok
  stringValue.current = 123; // Error: number is incompatible with string in property current
}

{
  const foo: {current: Foo | null} = React.useRef(new Foo()); // Ok
}

{
  const foo: {current: Foo | null} = React.useRef(new Bar()); // Error: Bar is incompatible with Foo in property current
}
