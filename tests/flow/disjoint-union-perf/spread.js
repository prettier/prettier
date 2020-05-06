// @flow

export type Fragment = {|
  type: 'ONE_CONFIG',
|};

export type One = {|
  ...Fragment,
  config: null,
|};

export type Two = {|
  type: 'TWO_CONFIG',
  config: null,
|};

export type Union =
  | One
  | Two

function toMetricConfig(config: Union) {
  if(config.type === (0: any)) {}
};
