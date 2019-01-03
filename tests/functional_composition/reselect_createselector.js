import { createSelector } from 'reselect';

const resolve = createSelector(
  getIds,
  getObjects,
  (ids, objects) => ids.map(id => objects[id])
);

const resolve = createSelector(
  [getIds, getObjects],
  (ids, objects) => ids.map(id => objects[id])
);
