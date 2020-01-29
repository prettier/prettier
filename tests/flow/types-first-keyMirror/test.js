// @flow

import type { LayerActionType } from "./Layer";
const {LayerKey, LayerActions} = require("./Layer");

({
  type: 'LAYER_SET_LAYER_LABEL',
  layerKey: new LayerKey()
}: LayerActionType);

import type {Action} from './Action';
const {ActionTypes} = require('./Action');

const openModal = (
  action: Action,
): number => {
  switch (action.type) {
    case ActionTypes.SET_OPEN_MODAL:
      return action.modalType;
    case ActionTypes.CLOSE_OPEN_MODAL:
      return 0;
    default:
      return 0;
  }
};
