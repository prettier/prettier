// @flow

/* This is a regression test. When the config passed to createElement and the
 * component's defaultProps both define a given property, we do a CondT test to
 * ensure that void-typed config values are replaced with the default value.
 * This CondT check used to unwrap opaque types with a declared supertype, which
 * would cause an error. Instead, we need to preserve the unwrapped opaque type.
 */

const React = require("react");

declare opaque type T: string;
declare var x: T;

type Props = { foo: T }

class C extends React.Component<Props, void> {
  static defaultProps = { foo: x };
}

(<C foo={x} />); // OK
