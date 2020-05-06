// @flow

const keyMirror = require('./keyMirror');

export type Action =
  | {type: 'SET_OPEN_MODAL', modalType: number}
  | {type: 'CLOSE_OPEN_MODAL'}

exports.ActionTypes = keyMirror({
  SET_OPEN_MODAL: '',
  CLOSE_OPEN_MODAL: '',
});
