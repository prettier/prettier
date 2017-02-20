prevState = prevState || {
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
