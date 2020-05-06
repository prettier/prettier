// @flow

import React from 'react';

class Tuple
  extends React.Component<{children: [boolean, string, number]}, void> {}
class TupleOne extends React.Component<{children: [boolean]}, void> {}

<Tuple />; // Error: `children` is required.
<Tuple>{true}{'foo'}{42}</Tuple>; // OK: All the tuple items.
<Tuple>{true}foo{42}</Tuple>; // OK: Mixing text with expressions.
<Tuple>{true}{'foo'}{42}{null}</Tuple>; // Error: One to many.
<Tuple>  {true}foo{42}</Tuple>; // Error: Spaces add items.
<Tuple>{true}foo{42}  </Tuple>; // Error: Spaces add items.
<Tuple>{[true, 'foo', 42]}</Tuple>; // OK: All the tuple items.
<Tuple>{[true, 'foo', 42]}{[true, 'foo', 42]}</Tuple>; // Error: There may only
                                                       // be one tuple.
<Tuple>{[true, 'foo', 42, null]}</Tuple>; // Error: One to many

// OK: All the tuple items on multiple liens.
<Tuple>
  {true}
  {'foo'}
  {42}
</Tuple>;

// OK: All the tuple items mixing text and expressions.
<Tuple>
  {true}
  foo
  {42}
</Tuple>;

<TupleOne>{true}</TupleOne>; // Error: A single expression is not an array.
<TupleOne>{[true]}</TupleOne>; // OK: This is ok.
