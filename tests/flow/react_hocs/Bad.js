// @flow

import * as React from 'react';
import {compose, mapProps, withProps} from './hocs';

type Props = {
  foo: number,
  bar: number,
};

const Bad = (props: Props) => null;

export default (compose(
  mapProps(({ buz }) => ({ // Error: Missing foo
    buz: (buz * 2).toString(), // Error: string ~> number
  })),
  withProps(({ buz }) => ({
    bar: buz,
  })),
)(Bad): React.ComponentType<empty>);
