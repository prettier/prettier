// @flow

import React from 'react';

class Foo extends React.Component<{children: Array<string>}, void> {}

<Foo>{...["a", "b"]}</Foo>
