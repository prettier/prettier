// @flow

const { foo, bar, FooComponent, BarComponent } = require('./a');
const React = require('react');

(foo: () => void);
(foo.x: number);
(foo.x: string);
(foo.other: number);

(bar: () => void);
(bar.x: number);
(bar.x: string);
(bar.other: number);

<FooComponent/>;
<FooComponent other={1}/>;

<BarComponent/>;
<BarComponent other={1}/>;

const {
  foo: poly_foo,
  bar: poly_bar,
  FooComponent: PolyFooComponent,
  BarComponent: PolyBarComponent
} = require('./poly_a');

(poly_foo: () => void);
(poly_foo: <T>() => void);
(poly_foo.x: number);
(poly_foo.x: string);
(poly_foo.other: number);

(poly_bar: () => void);
(poly_bar: <T>() => void);
(poly_bar.x: number);
(poly_bar.x: string);
(poly_bar.other: number);

<PolyFooComponent t={0}/>;
<PolyFooComponent t={0} other={1}/>;

<PolyBarComponent t={0}/>;
<PolyBarComponent t={0} other={1}/>;
