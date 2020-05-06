// @flow

import React from 'react';

class Foo extends React.Component<{}, void> {}

<Foo />; // OK
<Foo key="42" />; // OK
<Foo key={42} />; // OK
<Foo key={null} />; // OK
<Foo key={undefined} />; // OK
<Foo key={true} />; // Error

class FooExact extends React.Component<{||}, void> {}

<FooExact />; // OK
<FooExact key="42" />; // OK
<FooExact key={42} />; // OK
<FooExact key={null} />; // OK
<FooExact key={undefined} />; // OK
<FooExact key={true} />; // Error
