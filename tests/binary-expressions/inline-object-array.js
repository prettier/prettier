prevState = prevState || {
  catalogs: [],
  loadState: LOADED,
  opened: false,
  searchQuery: '',
  selectedCatalog: null,
};

prevState = prevState ||
  defaultState || {
    catalogs: [],
    loadState: LOADED,
    opened: false,
    searchQuery: '',
    selectedCatalog: null,
  };

this.steps = steps || [
  {
    name: 'mock-module',
    path: '/nux/mock-module',
  },
];

const create = () => {
  const result = doSomething();
  return (
    shouldReturn &&
    result.ok && {
      status: "ok",
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }
  );
}

const obj = {
  state: shouldHaveState &&
    stateIsOK && {
      loadState: LOADED,
      opened: false
    },
  loaded: true
}
