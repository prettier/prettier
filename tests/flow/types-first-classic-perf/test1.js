// @flow

import type {InputDefinition} from './test2';

type InputNodeProps = {
  onChange: (newInputDefinition: InputDefinition) => void,
};

function InputNode(props: InputNodeProps) { }

module.exports = InputNode;
