// @flow

const React = require('react');

type Node =
    null
  | boolean
  | number
  | string
  | React$Element<any>
  | Iterable<?React$Node>;

type Props = {|
  title?: ?number | Node,
|};

declare var x : Props;
const {title} = x;

((title != null ? title.toString() : '') : string)
