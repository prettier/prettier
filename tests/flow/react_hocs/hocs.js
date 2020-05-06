// @flow

import * as React from 'react';

declare export var compose: $Compose;

export function mapProps<InputProps, OutputProps>(
  mapperFn: (InputProps) => OutputProps,
): (React.ComponentType<OutputProps>) => React.ComponentType<InputProps> {
  return Component => props => <Component {...mapperFn(props)} />;
}

export function withProps<Props, ExtraProps>(
  extraFn: (Props) => ExtraProps,
): (React.ComponentType<{|
  ...Props,
  ...ExtraProps,
|}>) => React.ComponentType<Props> {
  // $FlowFixMe: This will be ok when we have value spread.
  return Component => props => <Component {...props} {...extraFn(props)} />;
}
