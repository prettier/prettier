const arrayify = (object, keyName) =>
  Object.entries(object).map(([key, value]) => ({
    [keyName]: key,
    ...value,
  }));

export default arrayify;
