// @flow

import * as React from 'react';
import {compose, mapProps, withProps} from './hocs';

type Props = {
  foo: string,
  bar: number,
  qux: number,
};

const Good = (props: Props) => null;

export default (compose(
  mapProps(({ foo, buz, qux }) => ({
    foo: foo.toString(),
    buz: buz * 2,
    qux,
  })),
  withProps(({ buz }) => ({
    bar: buz,
  })),
)(Good): React.ComponentType<{foo: number, buz: number, qux: number}>);
