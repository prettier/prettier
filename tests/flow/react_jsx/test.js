// @flow

import * as React from 'react';

// Utility. We want a value for any.
const any: any = null;

// Utility. We want to be able to enhance some components.
function hoc<Props, Component: React.ComponentType<Props>>(
  WrappedComponent: Component,
): React.ComponentType<React.ElementConfig<Component>> {
  return (props: Props) => <WrappedComponent {...props} />;
}

/* ========================================================================== *\
 * NoProps                                                                    *
\* ========================================================================== */

type Props_NoProps = {};

const Legacy_NoProps = React.createClass({propTypes: {}});
<Legacy_NoProps />; // OK: There are no props.
<Legacy_NoProps foo={42} />; // OK: Extra props are fine.

class Class_NoProps extends React.Component<Props_NoProps> {}
<Class_NoProps />; // OK: There are no props.
<Class_NoProps foo={42} />; // OK: Extra props are fine.

class ClassExact_NoProps extends React.Component<$Exact<Props_NoProps>> {}
<ClassExact_NoProps />; // OK: There are no props.
<ClassExact_NoProps foo={42} />; // Error: Exact type does not have `foo`.

class ClassPure_NoProps extends React.PureComponent<Props_NoProps> {}
<ClassPure_NoProps />; // OK: There are no props.
<ClassPure_NoProps foo={42} />; // OK: Extra props are fine.

const Function_NoProps = (props: Props_NoProps) => any;
<Function_NoProps />; // OK: There are no props.
<Function_NoProps foo={42} />; // OK: Extra props are fine.

const FunctionExact_NoProps = (props: $Exact<Props_NoProps>) => any;
<FunctionExact_NoProps />; // OK: There are no props.
<FunctionExact_NoProps foo={42} />; // Error: Exact type does not have `foo`.

const Abstract_NoProps: React.ComponentType<Props_NoProps> = any;
<Abstract_NoProps />; // OK: There are no props.
<Abstract_NoProps foo={42} />; // OK: Extra props are fine.

const AbstractExact_NoProps: React.ComponentType<$Exact<Props_NoProps>> = any;
<AbstractExact_NoProps />; // OK: There are no props.
<AbstractExact_NoProps foo={42} />; // Error: Exact type does not have `foo`.

const Member_NoProps = {prop: Class_NoProps};
<Member_NoProps.prop />; // OK: There are no props.
<Member_NoProps.prop foo={42} />; // OK: Extra props are fine.

const EnhancedClass_NoProps = hoc(Class_NoProps);
<EnhancedClass_NoProps />; // OK: There are no props.
<EnhancedClass_NoProps foo={42} />; // OK: Extra props are fine.

const EnhancedFunction_NoProps = hoc(Function_NoProps);
<EnhancedFunction_NoProps />; // OK: There are no props.
<EnhancedFunction_NoProps foo={42} />; // OK: Extra props are fine.

/* ========================================================================== *\
 * ManyProps                                                                  *
\* ========================================================================== */

type Props_ManyProps = {
  string1: string,
  string2: string,
  boolean1: boolean,
  boolean2: boolean,
  number: number,
};

const Legacy_ManyProps = React.createClass({
  propTypes: {
    string1: React.PropTypes.string.isRequired,
    string2: React.PropTypes.string.isRequired,
    boolean1: React.PropTypes.bool.isRequired,
    boolean2: React.PropTypes.bool.isRequired,
    number: React.PropTypes.number.isRequired,
  },
});
<Legacy_ManyProps />; // Error: There are no props.
<Legacy_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
/>;
<Legacy_ManyProps // OK: Other props are allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
  a={1}
  b={2}
  c={3}
/>;
<Legacy_ManyProps // Error: All props have an incorrect type.
  string1={null}
  string2={null}
  boolean1={null}
  boolean2={null}
  number={null}
/>;
<Legacy_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42}}
/>;
<Legacy_ManyProps // OK: All props are defined.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
  {...{number: 42}}
/>;
<Legacy_ManyProps // Error: Missing `number`.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
/>;
<Legacy_ManyProps // OK: Extra props are allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42, a: 1, b: 2, c: 3}}
/>;
<Legacy_ManyProps // OK: `number` is overwritten at the end of the element.
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
  boolean1
  boolean2={false}
  number={42}
/>;
<Legacy_ManyProps // Error: `number` cannot be null.
  boolean1
  boolean2={false}
  number={42}
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
/>;

class Class_ManyProps extends React.Component<Props_ManyProps> {}
<Class_ManyProps />; // Error: There are no props.
<Class_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
/>;
<Class_ManyProps // OK: Other props are allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
  a={1}
  b={2}
  c={3}
/>;
<Class_ManyProps // Error: All props have an incorrect type.
  string1={null}
  string2={null}
  boolean1={null}
  boolean2={null}
  number={null}
/>;
<Class_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42}}
/>;
<Class_ManyProps // OK: All props are defined.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
  {...{number: 42}}
/>;
<Class_ManyProps // Error: Missing `number`.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
/>;
<Class_ManyProps // OK: Extra props are allowed. Error for exact types.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42, a: 1, b: 2, c: 3}}
/>;
<Class_ManyProps // OK: `number` is overwritten at the end of the element.
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
  boolean1
  boolean2={false}
  number={42}
/>;
<Class_ManyProps // Error: `number` cannot be null.
  boolean1
  boolean2={false}
  number={42}
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
/>;

class ClassExact_ManyProps extends React.Component<$Exact<Props_ManyProps>> {}
<ClassExact_ManyProps />; // Error: There are no props.
<ClassExact_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
/>;
<ClassExact_ManyProps // Error: Extra props are not allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
  a={1}
  b={2}
  c={3}
/>;
<ClassExact_ManyProps // Error: All props have an incorrect type.
  string1={null}
  string2={null}
  boolean1={null}
  boolean2={null}
  number={null}
/>;
<ClassExact_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42}}
/>;
<ClassExact_ManyProps // OK: All props are defined.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
  {...{number: 42}}
/>;
<ClassExact_ManyProps // Error: Missing `number`.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
/>;
<ClassExact_ManyProps // Error: Extra props are not allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42, a: 1, b: 2, c: 3}}
/>;
<ClassExact_ManyProps // OK: `number` is overwritten at the end of the element.
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
  boolean1
  boolean2={false}
  number={42}
/>;
<ClassExact_ManyProps // Error, `number` is overwritten at the end of the element
  boolean1
  boolean2={false}
  number={42}
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
/>;

class ClassPure_ManyProps extends React.PureComponent<Props_ManyProps> {}
<ClassPure_ManyProps />; // Error: There are no props.
<ClassPure_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
/>;
<ClassPure_ManyProps // OK: Other props are allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
  a={1}
  b={2}
  c={3}
/>;
<ClassPure_ManyProps // Error: All props have an incorrect type.
  string1={null}
  string2={null}
  boolean1={null}
  boolean2={null}
  number={null}
/>;
<ClassPure_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42}}
/>;
<ClassPure_ManyProps // OK: All props are defined.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
  {...{number: 42}}
/>;
<ClassPure_ManyProps // Error: Missing `number`.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
/>;
<ClassPure_ManyProps // OK: Extra props are allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42, a: 1, b: 2, c: 3}}
/>;
<ClassPure_ManyProps // OK: `number` is overwritten at the end of the element.
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
  boolean1
  boolean2={false}
  number={42}
/>;
<ClassPure_ManyProps // Error: `number` cannot be null.
  boolean1
  boolean2={false}
  number={42}
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
/>;

const Function_ManyProps = (props: Props_ManyProps) => any;
<Function_ManyProps />; // Error: There are no props.
<Function_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
/>;
<Function_ManyProps // OK: Other props are allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
  a={1}
  b={2}
  c={3}
/>;
<Function_ManyProps // Error: All props have an incorrect type.
  string1={null}
  string2={null}
  boolean1={null}
  boolean2={null}
  number={null}
/>;
<Function_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42}}
/>;
<Function_ManyProps // OK: All props are defined.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
  {...{number: 42}}
/>;
<Function_ManyProps // Error: Missing `number`.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
/>;
<Function_ManyProps // OK: Extra props are allowed. Error for exact types.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42, a: 1, b: 2, c: 3}}
/>;
<Function_ManyProps // OK: `number` is overwritten at the end of the element.
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
  boolean1
  boolean2={false}
  number={42}
/>;
<Function_ManyProps // Error: `number` cannot be null.
  boolean1
  boolean2={false}
  number={42}
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
/>;

const FunctionExact_ManyProps = (props: $Exact<Props_ManyProps>) => any;
<FunctionExact_ManyProps />; // Error: There are no props.
<FunctionExact_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
/>;
<FunctionExact_ManyProps // OK: Other props are allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
  a={1}
  b={2}
  c={3}
/>;
<FunctionExact_ManyProps // Error: All props have an incorrect type.
  string1={null}
  string2={null}
  boolean1={null}
  boolean2={null}
  number={null}
/>;
<FunctionExact_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42}}
/>;
<FunctionExact_ManyProps // OK: All props are defined.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
  {...{number: 42}}
/>;
<FunctionExact_ManyProps // Error: Missing `number`.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
/>;
<FunctionExact_ManyProps // Error: Extra props are not allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42, a: 1, b: 2, c: 3}}
/>;
<FunctionExact_ManyProps // Error (TODO), but OK: `number` is overwritten.
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
  boolean1
  boolean2={false}
  number={42}
/>;
<FunctionExact_ManyProps // Error: `number` is overwritten at the end of the element
  boolean1
  boolean2={false}
  number={42}
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
/>;

const Abstract_ManyProps: React.ComponentType<Props_ManyProps> = any;
<Abstract_ManyProps />; // Error: There are no props.
<Abstract_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
/>;
<Abstract_ManyProps // OK: Other props are allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
  a={1}
  b={2}
  c={3}
/>;
<Abstract_ManyProps // Error: All props have an incorrect type.
  string1={null}
  string2={null}
  boolean1={null}
  boolean2={null}
  number={null}
/>;
<Abstract_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42}}
/>;
<Abstract_ManyProps // OK: All props are defined.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
  {...{number: 42}}
/>;
<Abstract_ManyProps // Error: Missing `number`.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
/>;
<Abstract_ManyProps // OK: Extra props are allowed. Error for exact types.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42, a: 1, b: 2, c: 3}}
/>;
<Abstract_ManyProps // OK: `number` is overwritten at the end of the element.
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
  boolean1
  boolean2={false}
  number={42}
/>;
<Abstract_ManyProps // Error: `number` cannot be null.
  boolean1
  boolean2={false}
  number={42}
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
/>;

const AbstractExact_ManyProps: React.ComponentType<$Exact<Props_ManyProps>>
  = any;
<AbstractExact_ManyProps />; // Error: There are no props.
<AbstractExact_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
/>;
<AbstractExact_ManyProps // Error: Other props are not allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
  a={1}
  b={2}
  c={3}
/>;
<AbstractExact_ManyProps // Error: All props have an incorrect type.
  string1={null}
  string2={null}
  boolean1={null}
  boolean2={null}
  number={null}
/>;
<AbstractExact_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42}}
/>;
<AbstractExact_ManyProps // OK: All props are defined.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
  {...{number: 42}}
/>;
<AbstractExact_ManyProps // Error: Missing `number`.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
/>;
<AbstractExact_ManyProps // Error: Extra props are not allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42, a: 1, b: 2, c: 3}}
/>;
<AbstractExact_ManyProps // OK: `number` is overwritten.
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
  boolean1
  boolean2={false}
  number={42}
/>;
<AbstractExact_ManyProps // OK: `number` is overwritten.
  boolean1
  boolean2={false}
  number={42}
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
/>;

const Member_ManyProps = {prop: Class_ManyProps};
<Member_ManyProps.prop />; // Error: There are no props.
<Member_ManyProps.prop // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
/>;
<Member_ManyProps.prop // OK: Other props are allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
  a={1}
  b={2}
  c={3}
/>;
<Member_ManyProps.prop // Error: All props have an incorrect type.
  string1={null}
  string2={null}
  boolean1={null}
  boolean2={null}
  number={null}
/>;
<Member_ManyProps.prop // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42}}
/>;
<Member_ManyProps.prop // OK: All props are defined.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
  {...{number: 42}}
/>;
<Member_ManyProps.prop // Error: Missing `number`.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
/>;
<Member_ManyProps.prop // OK: Extra props are allowed. Error for exact types.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42, a: 1, b: 2, c: 3}}
/>;
<Member_ManyProps.prop // OK: `number` is overwritten at the end of the element.
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
  boolean1
  boolean2={false}
  number={42}
/>;
<Member_ManyProps.prop // Error: `number` cannot be null.
  boolean1
  boolean2={false}
  number={42}
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
/>;

const EnhancedClass_ManyProps = hoc(Class_ManyProps);
<EnhancedClass_ManyProps />; // Error: There are no props.
<EnhancedClass_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
/>;
<EnhancedClass_ManyProps // OK: Other props are allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
  a={1}
  b={2}
  c={3}
/>;
<EnhancedClass_ManyProps // Error: All props have an incorrect type.
  string1={null}
  string2={null}
  boolean1={null}
  boolean2={null}
  number={null}
/>;
<EnhancedClass_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42}}
/>;
<EnhancedClass_ManyProps // OK: All props are defined.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
  {...{number: 42}}
/>;
<EnhancedClass_ManyProps // Error: Missing `number`.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
/>;
<EnhancedClass_ManyProps // OK: Extra props are allowed. Error for exact types.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42, a: 1, b: 2, c: 3}}
/>;
<EnhancedClass_ManyProps // OK: `number` is overwritten at the end of the element.
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
  boolean1
  boolean2={false}
  number={42}
/>;
<EnhancedClass_ManyProps // Error: `number` cannot be null.
  boolean1
  boolean2={false}
  number={42}
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
/>;

const EnhancedFunction_ManyProps = hoc(Function_ManyProps);
<EnhancedFunction_ManyProps />; // Error: There are no props.
<EnhancedFunction_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
/>;
<EnhancedFunction_ManyProps // OK: Other props are allowed.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  number={42}
  a={1}
  b={2}
  c={3}
/>;
<EnhancedFunction_ManyProps // Error: All props have an incorrect type.
  string1={null}
  string2={null}
  boolean1={null}
  boolean2={null}
  number={null}
/>;
<EnhancedFunction_ManyProps // OK: All props are defined.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42}}
/>;
<EnhancedFunction_ManyProps // OK: All props are defined.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
  {...{number: 42}}
/>;
<EnhancedFunction_ManyProps // Error: Missing `number`.
  {...{string1: 'foo', string2: 'bar'}}
  {...{boolean1: true, boolean2: false}}
/>;
<EnhancedFunction_ManyProps // OK: Extra props are allowed. Error for exact types.
  string1="foo"
  string2={'bar'}
  boolean1
  boolean2={false}
  {...{number: 42, a: 1, b: 2, c: 3}}
/>;
<EnhancedFunction_ManyProps // OK: `number` is overwritten at the end of the element.
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
  boolean1
  boolean2={false}
  number={42}
/>;
<EnhancedFunction_ManyProps // Error: `number` cannot be null.
  boolean1
  boolean2={false}
  number={42}
  {...{string1: 'foo', string2: 'bar', number: (any: ?number)}}
/>;

/* ========================================================================== *\
 * OptionalProps                                                              *
\* ========================================================================== */

type Props_OptionalProps = {foo: ?number, bar?: number};

const Legacy_OptionalProps = React.createClass({
  propTypes: {
    foo: React.PropTypes.number.isRequired,
    bar: React.PropTypes.number,
  },
});
<Legacy_OptionalProps />; // Error: `foo` is required.
<Legacy_OptionalProps foo={42} />; // OK: `foo` is defined.
<Legacy_OptionalProps foo={undefined} />; // Error: No ?number proptype.
<Legacy_OptionalProps // OK: Both props are defined with a correct type.
  foo={4}
  bar={2}
/>;
<Legacy_OptionalProps // Error: `foo` has a bad type.
  foo="nope"
  bar={2}
/>;
<Legacy_OptionalProps // Error: `bar` has a bad type.
  foo={4}
  bar="nope"
/>;

class Class_OptionalProps extends React.Component<Props_OptionalProps> {}
<Class_OptionalProps />; // Error: `foo` is required.
<Class_OptionalProps foo={42} />; // OK: `foo` is defined.
<Class_OptionalProps foo={undefined} />; // OK: `foo` is defined as undefined.
<Class_OptionalProps // OK: Both props are defined with a correct type.
  foo={4}
  bar={2}
/>;
<Class_OptionalProps // Error: `foo` has a bad type.
  foo="nope"
  bar={2}
/>;
<Class_OptionalProps // Error: `bar` has a bad type.
  foo={4}
  bar="nope"
/>;

class ClassExact_OptionalProps
  extends React.Component<$Exact<Props_OptionalProps>> {}
<ClassExact_OptionalProps />; // Error: `foo` is required.
<ClassExact_OptionalProps foo={42} />; // OK: `foo` is defined.
<ClassExact_OptionalProps foo={undefined} />; // OK: `foo` may be undefined.
<ClassExact_OptionalProps // OK: Both props are defined with a correct type.
  foo={4}
  bar={2}
/>;
<ClassExact_OptionalProps // Error: `foo` has a bad type.
  foo="nope"
  bar={2}
/>;
<ClassExact_OptionalProps // Error: `bar` has a bad type.
  foo={4}
  bar="nope"
/>;

class ClassPure_OptionalProps
  extends React.PureComponent<Props_OptionalProps> {}
<ClassPure_OptionalProps />; // Error: `foo` is required.
<ClassPure_OptionalProps foo={42} />; // OK: `foo` is defined.
<ClassPure_OptionalProps foo={undefined} />; // OK: `foo` may be undefined.
<ClassPure_OptionalProps // OK: Both props are defined with a correct type.
  foo={4}
  bar={2}
/>;
<ClassPure_OptionalProps // Error: `foo` has a bad type.
  foo="nope"
  bar={2}
/>;
<ClassPure_OptionalProps // Error: `bar` has a bad type.
  foo={4}
  bar="nope"
/>;

const Function_OptionalProps = (props: Props_OptionalProps) => any;
<Function_OptionalProps />; // Error: `foo` is required.
<Function_OptionalProps foo={42} />; // OK: `foo` is defined.
<Function_OptionalProps foo={undefined} />; // OK: `foo` may be undefined.
<Function_OptionalProps // OK: Both props are defined with a correct type.
  foo={4}
  bar={2}
/>;
<Function_OptionalProps // Error: `foo` has a bad type.
  foo="nope"
  bar={2}
/>;
<Function_OptionalProps // Error: `bar` has a bad type.
  foo={4}
  bar="nope"
/>;

const FunctionExact_OptionalProps = (props: $Exact<Props_OptionalProps>) => any;
<FunctionExact_OptionalProps />; // Error: `foo` is required.
<FunctionExact_OptionalProps foo={42} />; // OK: `foo` is defined.
<FunctionExact_OptionalProps foo={undefined} />; // OK: `foo` may be undefined.
<FunctionExact_OptionalProps // OK: Both props are defined with a correct type.
  foo={4}
  bar={2}
/>;
<FunctionExact_OptionalProps // Error: `foo` has a bad type.
  foo="nope"
  bar={2}
/>;
<FunctionExact_OptionalProps // Error: `bar` has a bad type.
  foo={4}
  bar="nope"
/>;

const Abstract_OptionalProps: React.ComponentType<Props_OptionalProps> = any;
<Abstract_OptionalProps />; // Error: `foo` is required.
<Abstract_OptionalProps foo={42} />; // OK: `foo` is defined.
<Abstract_OptionalProps foo={undefined} />; // OK: `foo` may be undefined.
<Abstract_OptionalProps // OK: Both props are defined with a correct type.
  foo={4}
  bar={2}
/>;
<Abstract_OptionalProps // Error: `foo` has a bad type.
  foo="nope"
  bar={2}
/>;
<Abstract_OptionalProps // Error: `bar` has a bad type.
  foo={4}
  bar="nope"
/>;

const AbstractExact_OptionalProps:
  React.ComponentType<$Exact<Props_OptionalProps>> = any;
<AbstractExact_OptionalProps />; // Error: `foo` is required.
<AbstractExact_OptionalProps foo={42} />; // OK: `foo` is defined.
<AbstractExact_OptionalProps foo={undefined} />; // OK: `foo` may be undefined.
<AbstractExact_OptionalProps // OK: Both props are defined with a correct type.
  foo={4}
  bar={2}
/>;
<AbstractExact_OptionalProps // Error: `foo` has a bad type.
  foo="nope"
  bar={2}
/>;
<AbstractExact_OptionalProps // Error: `bar` has a bad type.
  foo={4}
  bar="nope"
/>;

const Member_OptionalProps = {prop: Class_OptionalProps};
<Member_OptionalProps.prop />; // Error: `foo` is required.
<Member_OptionalProps.prop foo={42} />; // OK: `foo` is defined.
<Member_OptionalProps.prop foo={undefined} />; // OK: `foo` is undefined.
<Member_OptionalProps.prop // OK: Both props are defined with a correct type.
  foo={4}
  bar={2}
/>;
<Member_OptionalProps.prop // Error: `foo` has a bad type.
  foo="nope"
  bar={2}
/>;
<Member_OptionalProps.prop // Error: `bar` has a bad type.
  foo={4}
  bar="nope"
/>;

const EnhancedClass_OptionalProps = hoc(Class_OptionalProps);
<EnhancedClass_OptionalProps />; // Error: `foo` is required.
<EnhancedClass_OptionalProps foo={42} />; // OK: `foo` is defined.
<EnhancedClass_OptionalProps foo={undefined} />; // OK: `foo` is defined as undefined.
<EnhancedClass_OptionalProps // OK: Both props are defined with a correct type.
  foo={4}
  bar={2}
/>;
<EnhancedClass_OptionalProps // Error: `foo` has a bad type.
  foo="nope"
  bar={2}
/>;
<EnhancedClass_OptionalProps // Error: `bar` has a bad type.
  foo={4}
  bar="nope"
/>;

const EnhancedFunction_OptionalProps = hoc(Function_OptionalProps);
<EnhancedFunction_OptionalProps />; // Error: `foo` is required.
<EnhancedFunction_OptionalProps foo={42} />; // OK: `foo` is defined.
<EnhancedFunction_OptionalProps foo={undefined} />; // OK: `foo` is defined as undefined.
<EnhancedFunction_OptionalProps // OK: Both props are defined with a correct type.
  foo={4}
  bar={2}
/>;
<EnhancedFunction_OptionalProps // Error: `foo` has a bad type.
  foo="nope"
  bar={2}
/>;
<EnhancedFunction_OptionalProps // Error: `bar` has a bad type.
  foo={4}
  bar="nope"
/>;

/* ========================================================================== *\
 * DefaultProps                                                               *
\* ========================================================================== */

type Props_DefaultProps = {
  foo: number,
  bar: number,
};

const Legacy_DefaultProps = React.createClass({
  propTypes: {
    foo: React.PropTypes.number.isRequired,
    bar: React.PropTypes.number.isRequired,
  },
  getDefaultProps: () => ({
    foo: 42,
  }),
});
<Legacy_DefaultProps // OK: It has all the props.
  foo={1}
  bar={2}
/>;
<Legacy_DefaultProps // OK: It is missing a default prop.
  bar={2}
/>;
<Legacy_DefaultProps // Error: It is missing a required non-default prop.
  foo={1}
/>;

class Class_DefaultProps extends React.Component<Props_DefaultProps> {
  static defaultProps = {
    foo: 42,
  };
}
<Class_DefaultProps // OK: It has all the props.
  foo={1}
  bar={2}
/>;
<Class_DefaultProps // OK: It is missing a default prop.
  bar={2}
/>;
<Class_DefaultProps // Error: It is missing a required non-default prop.
  foo={1}
/>;

class ClassExact_DefaultProps
  extends React.Component<$Exact<Props_DefaultProps>> {
  static defaultProps = {
    foo: 42,
  };
}
<ClassExact_DefaultProps // OK: It has all the props.
  foo={1}
  bar={2}
/>;
<ClassExact_DefaultProps // OK: It is missing a default prop.
  bar={2}
/>;
<ClassExact_DefaultProps // Error: It is missing a required non-default prop.
  foo={1}
/>;

class ClassPure_DefaultProps extends React.PureComponent<Props_DefaultProps> {
  static defaultProps = {
    foo: 42,
  };
}
<ClassPure_DefaultProps // OK: It has all the props.
  foo={1}
  bar={2}
/>;
<ClassPure_DefaultProps // OK: It is missing a default prop.
  bar={2}
/>;
<ClassPure_DefaultProps // Error: It is missing a required non-default prop.
  foo={1}
/>;

function Function_DefaultProps(props: Props_DefaultProps) {
  return any;
}
Function_DefaultProps.defaultProps = {
  foo: 42,
};
<Function_DefaultProps // OK: It has all the props.
  foo={1}
  bar={2}
/>;
<Function_DefaultProps // OK: It is missing a default prop.
  bar={2}
/>;
<Function_DefaultProps // Error: It is missing a required non-default prop.
  foo={1}
/>;

function FunctionExact_DefaultProps(props: $Exact<Props_DefaultProps>) {
  return any;
}
FunctionExact_DefaultProps.defaultProps = {
  foo: 42,
};
<FunctionExact_DefaultProps // OK: It has all the props.
  foo={1}
  bar={2}
/>;
<FunctionExact_DefaultProps // OK: It is missing a default prop.
  bar={2}
/>;
<FunctionExact_DefaultProps // Error: It is missing a required non-default prop.
  foo={1}
/>;

const Member_DefaultProps = {prop: Class_DefaultProps};
<Member_DefaultProps.prop // OK: It has all the props.
  foo={1}
  bar={2}
/>;
<Member_DefaultProps.prop // OK: It is missing a default prop.
  bar={2}
/>;
<Member_DefaultProps.prop // Error: It is missing a required non-default prop.
  foo={1}
/>;

const EnhancedClass_DefaultProps = hoc(Class_DefaultProps);
<EnhancedClass_DefaultProps // OK: It has all the props.
  foo={1}
  bar={2}
/>;
<EnhancedClass_DefaultProps // OK: It is missing a default prop.
  bar={2}
/>;
<EnhancedClass_DefaultProps // Error: It is missing a required non-default prop.
  foo={1}
/>;

const EnhancedFunction_DefaultProps = hoc(Function_DefaultProps);
<EnhancedFunction_DefaultProps // OK: It has all the props.
  foo={1}
  bar={2}
/>;
<EnhancedFunction_DefaultProps // OK: It is missing a default prop.
  bar={2}
/>;
<EnhancedFunction_DefaultProps // Error: It is missing a required non-default prop.
  foo={1}
/>;
