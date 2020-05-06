// @flow

const keyMirror = require("./keyMirror");

class LayerKey {}

const LayerActions = keyMirror({
  LAYER_SELECT_LAYER: null,
  LAYER_SET_LAYER_LABEL: null
});

export type LayerActionType =
  | {|
      type: typeof LayerActions.LAYER_SELECT_LAYER,
      layerKey: string
    |}
  | {|
      type: typeof LayerActions.LAYER_SET_LAYER_LABEL,
      layerKey: LayerKey
    |};

module.exports = { LayerKey, LayerActions };
