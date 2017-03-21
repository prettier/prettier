const fn = b => c => d => {
  return 3;
};

const mw = store => next => action => {
  return next(action)
}

const middleware = options => (req, res, next) => {
  // ...
};
