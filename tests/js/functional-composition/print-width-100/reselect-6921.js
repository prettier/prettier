export const isOngoingBooking = createSelector(
  getDetailsWithRoom,
  ({startDt, endDt}) => {
    return moment().isBetween(startDt, endDt, 'day');
  }
);

export const isOngoingBooking2 = createSelector(
  getDetailsWithRoom,
  ({startDt, endDt}) => moment().isBetween(startDt, endDt, 'day')
);

export const getFeatures = createSelector(
  getFeaturesMapping,
  features => {
    features = Object.values(features).map(f => _.pick(f, ['icon', 'name', 'title']));
    return _.sortBy(features, 'title');
  }
);

const subtotalSelector = createSelector(
  shopItemsSelector,
  items => items.reduce((acc, item) => acc + item.value, 0),
);
