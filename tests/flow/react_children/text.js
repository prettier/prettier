// @flow

import React from 'react';

class Text extends React.Component<{children: string}, void> {}
class TextOptional extends React.Component<{children?: string}, void> {}
class TextLiteral extends React.Component<{children: 'foo' | 'bar'}, void> {}

<Text />; // Error: `children` is required.
<TextOptional />; // OK: `children` is optional.
<TextLiteral />; // Error: `children` is required.

<Text>Hello, world!</Text>; // OK: `children` is a single string.

<Text></Text>; // Error: `children` does not exist.
<Text>  </Text>; // OK: `children` is some space.

<Text>{}</Text>; // Error: `children` is required.
<Text>{/* Hello, world! */}</Text>; // Error: `children` is required.
<Text>{undefined}</Text>; // Error: `undefined` is not allowed.
<Text>{null}</Text>; // Error: `null` is not allowed.
<Text>{true}</Text>; // Error: `boolean`s are not allowed.
<Text>{false}</Text>; // Error: `boolean`s are not allowed.
<Text>{0}</Text>; // Error: `number`s are not allowed.
<Text>{42}</Text>; // Error: `number`s are not allowed.
<Text><intrinsic/></Text>; // Error: elements are not allowed.

// OK: Text across multiple lines is fine.
<Text>
  Hello, world!
  Multiline.
</Text>;

<Text>{'Hello, world!'}</Text>; // OK: Single string in an expression container.
<Text>{'Hello, '}{'world!'}</Text>; // Error: We did not allow an array.
<Text>Hello, {'world!'}</Text>; // Error: We did not allow an array.
<Text>{'Hello, world!'}  </Text>; // Error: Spaces cause there to be an array.
<Text>  {'Hello, world!'}</Text>; // Error: Spaces cause there to be an array.

// OK: Newlines are trimmed.
<Text>
  {'Hello, world!'}
</Text>;

<TextLiteral>foo</TextLiteral>; // OK: Text literal is fine.
<TextLiteral>bar</TextLiteral>; // OK: Text literal is fine.
<TextLiteral>{'foo'}</TextLiteral>; // OK: Text literal is fine.
<TextLiteral>buz</TextLiteral>; // Error: `buz` is not allowed.
<TextLiteral>{'buz'}</TextLiteral>; // Error: `buz` is not allowed.
<TextLiteral>foo  </TextLiteral>; // Error: Spaces are not trimmed.
<TextLiteral>  foo</TextLiteral>; // Error: Spaces are not trimmed.
<TextLiteral>{'foo'}  </TextLiteral>; // Error: Spaces are not trimmed.
<TextLiteral>  {'foo'}</TextLiteral>; // Error: Spaces are not trimmed.

// OK: Newlines are trimmed.
<TextLiteral>
  foo
</TextLiteral>;
