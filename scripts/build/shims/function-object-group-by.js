const groupBy =
  Object.groupBy ??
  ((array, callback) => {
    const result = Object.create(null);
    for (const value of array) {
      const key = callback(value);
      if (result[key]) {
        result[key].push(value);
      } else {
        result[key] = [value];
      }
    }
    return result;
  });

export default groupBy;
