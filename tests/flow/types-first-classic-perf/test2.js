// @flow

// This file is in a dependency cycle with another file. In types-first, the representations of the
// types of this file, computed when merging the combined signature of these files, might be
// different than those computed when checking the code of this file separately. This might kill
// fast paths that are available in classic, where the combined code of these files is checked at
// once. For example, the combination of spread and union here can be deadly for perf.

const InputNode = require('./test1');

type DefaultInputParameters<TValue> = {|
  currentValue: TValue,
|};

export type SubFormDefinition = {|
  type: 'sub_form',
  ...DefaultInputParameters<InputDefinition>,
|};

export type VectorFormDefinition = {|
  type: 'vector',
  ...DefaultInputParameters<InputDefinition>,
|};

export type MapFormDefinition = {|
  type: 'map',
  ...DefaultInputParameters<InputDefinition>,
|};

export type InputDefinition =
  | SubFormDefinition
  | VectorFormDefinition
  | MapFormDefinition;

InputNode({
  onChange:(newInputDefinition: InputDefinition) => {},
});
