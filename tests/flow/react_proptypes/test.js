// @flow

const React = require('react');

const x: React$PropType$Primitive<
  ("smallcaps" | "small" | "medium" | "large" | "xlarge" | "inherit")
> = React.PropTypes.oneOf([
  'smallcaps',
  'small',
  'medium',
  'large',
  'xlarge',
  'inherit',
]);

const y: React$PropType$Primitive<
  Array<number>
> = React.PropTypes.arrayOf(React.PropTypes.number).isRequired;

const { PropTypes } = React;

const XShape = {
  x: PropTypes.number.isRequired
};
const FooShape = {
  foo: (PropTypes.shape(XShape).isRequired: React$PropType$Primitive$Required<{
    x: number
  }>)
};

(PropTypes.shape(FooShape): React$PropType$Primitive<{
  foo: {
    x: number,
  }
}>)
