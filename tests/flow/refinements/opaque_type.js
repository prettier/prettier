// @flow

export opaque type Opaque = string;

export type Dict = {
  [id: Opaque]: void,
};

export type Index = {
  index: Dict,
};

export type State = {
  o: null | Opaque,
  d: null | Index,
};
