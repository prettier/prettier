// @flow

/**
 * Pun intended.
 */

import React from 'react';

type Data = {
  foo: number,
  bar: number,
};

type Fn = (Data) => number;

class Fun extends React.Component<{children: Fn}, void> {}
class FunOptional extends React.Component<{children?: Fn}, void> {}
class Obj extends React.Component<{children: Data}, void> {}
class ObjOptional extends React.Component<{children?: Data}, void> {}
class FunArrayOnly extends React.Component<{children: Array<Fn>}, void> {}
class FunArray extends React.Component<{children: Fn | Array<Fn>}, void> {}

<Fun />; // Error: `children` is required.
<FunOptional />; // OK: `children` is optional.

<Fun>{() => 42}</Fun>; // OK: A function that returns a number.
<Fun>{() => 42}{() => 42}</Fun>; // Error: Two functions are not allowed.
<Fun>{data => data.foo + data.bar}</Fun>; // OK: Correctly typed function.
<Fun>{() => 42}  </Fun>; // Error: Spaces make it an array.
<Fun>  {() => 42}</Fun>; // Error: Spaces make it an array.

// OK: Newlines are fine though.
<Fun>
  {() => 42}
</Fun>;

<Fun>
  {data => {
    (data.foo: number); // OK: `foo` is a number.
    (data.bar: string); // Error: `bar` is a number.
    (data.nope: boolean); // Error: `nope` does not exist.
    return '42'; // Error: Must return a number.
  }}
</Fun>;

<Fun>{}</Fun>; // Error: `void` is not allowed.
<Fun>{/* Hello, world! */}</Fun>; // Error: comments are not allowed.
<Fun>{undefined}</Fun>; // Error: `undefined` is not allowed.
<Fun>{null}</Fun>; // Error: `null` is not allowed.
<Fun>{true}</Fun>; // Error: `boolean`s are not allowed.
<Fun>{false}</Fun>; // Error: `boolean`s are not allowed.
<Fun>{0}</Fun>; // Error: `number`s are not allowed.
<Fun>{42}</Fun>; // Error: `number`s are not allowed.
<Fun><intrinsic/></Fun>; // Error: elements are not allowed.

<Obj />; // Error: `children` is required.
<ObjOptional />; // OK: `children` is optional.

<Obj>{{foo: 1, bar: 2}}</Obj>; // OK: The data object.
<Obj>{{foo: '1', bar: '2'}}</Obj>; // Error: Incorrect types.
<Obj>{{foo: 1, bar: 2}}{{foo: 1, bar: 2}}</Obj>; // Error: Two objects are not
                                                 // allowed.
<Obj>{{foo: 1, bar: 2}}  </Obj>; // Error: Spaces make it an array.
<Obj>  {{foo: 1, bar: 2}}</Obj>; // Error: Spaces make it an array.

// OK: Newlines are fine though.
<Obj>
  {{foo: 1, bar: 2}}
</Obj>;

<FunArrayOnly>{() => 42}</FunArrayOnly>; // Error: A single expression is not
                                         // an array.
<FunArrayOnly>{() => 42}{() => 42}</FunArrayOnly>; // OK: This is an array.
<FunArrayOnly>{[() => 42, () => 42]}</FunArrayOnly>; // OK: This is an array.

// Error: This is an array of arrays.
<FunArrayOnly>{[() => 42, () => 42]}{[() => 42, () => 42]}</FunArrayOnly>;

// Error: This is an array of arrays with mixed dimensions.
<FunArrayOnly>{[() => 42, () => 42]}{() => 42}</FunArrayOnly>;

// Error: A single expression is not an array.
<FunArrayOnly>
  {() => 42}
</FunArrayOnly>;

// OK: This is an array without strings even though there are newlines.
<FunArrayOnly>
  {() => 42}
  {() => 42}
  {() => 42}
</FunArrayOnly>;

// OK: This is also an array.
<FunArrayOnly>
  {[
    () => 42,
    () => 42,
    () => 42,
  ]}
</FunArrayOnly>;

<FunArray>{() => 42}</FunArray>; // OK: Allows single expressions.
<FunArray>{() => 42}{() => 42}</FunArray>; // OK: This is an array.
<FunArray>{[() => 42, () => 42]}</FunArray>; // OK: This is an array.

// Error: This is an array of arrays.
<FunArray>{[() => 42, () => 42]}{[() => 42, () => 42]}</FunArray>;

// Error: This is an array of arrays with mixed dimensions.
<FunArray>{[() => 42, () => 42]}{() => 42}</FunArray>;

// OK: Allows single expressions.
<FunArray>
  {() => 42}
</FunArray>;

// OK: This is an array without strings even though there are newlines.
<FunArray>
  {() => 42}
  {() => 42}
  {() => 42}
</FunArray>;

// OK: This is also an array.
<FunArray>
  {[
    () => 42,
    () => 42,
    () => 42,
  ]}
</FunArray>;

<FunArray>{}</FunArray>; // Error: `void` is not allowed.
<FunArray>{/* Hello, world! */}</FunArray>; // Error: comments are not allowed.
<FunArray>{undefined}</FunArray>; // Error: `undefined` is not allowed.
<FunArray>{null}</FunArray>; // Error: `null` is not allowed.
<FunArray>{true}</FunArray>; // Error: `boolean`s are not allowed.
<FunArray>{false}</FunArray>; // Error: `boolean`s are not allowed.
<FunArray>{0}</FunArray>; // Error: `boolean`s are not allowed.
<FunArray>{42}</FunArray>; // Error: `boolean`s are not allowed.
<FunArray><intrinsic/></FunArray>; // Error: elements are not allowed.
