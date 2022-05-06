function arrayToMap(array) {
  const map = Object.create(null);
  for (const value of array) {
    map[value] = true;
  }
  return map;
}

export default arrayToMap;
