// @flow

import React from 'react';

{
  React.useMutationEffect(); // Error: function requires another argument.
}

type CustomType = {|
  foo: string,
  bar: number,
|};

{
  let stringValue: string;
  let numericValue: number;
  let customValue: CustomType;

  const StringContext = React.createContext('hello');
  stringValue = React.useContext(StringContext); // Ok
  numericValue = React.useContext(StringContext); // Error: string is incompatible with number

  const InvalidContext: React$Context<CustomType> = React.createContext('hello'); // Error: inexact string is incompatible with exact CustomType

  const CustomContext: React$Context<CustomType> = React.createContext({
    foo: 'abc',
    bar: 123,
  });
  stringValue = React.useContext(CustomContext); // Error: CustomType is incompatible with string
  customValue = React.useContext(CustomContext); // Ok
}

{
  const Context = React.createContext(
    {foo: 0, bar: 0, baz: 0},
    (a, b) => {
      let result = 0;
      if (a.foo !== b.foo) {
        result |= 0b001;
      }
      if (a.bar !== b.bar) {
        result |= 0b010;
      }
      if (a.baz !== b.baz) {
        result |= 0b100;
      }
      return result;
    },
  );
  const {foo} = React.useContext(Context, 0b001);
  (foo: number); // Ok
  const {bar} = React.useContext(Context, 0b010);
  (bar: number); // Ok
  (bar: string); // Error: number is incompatible with string
}
