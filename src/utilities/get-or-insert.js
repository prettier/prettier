function getOrInsertComputed(map, key, callback) {
  if (map.has(key)) {
    return map.get(key);
  }

  const value = callback(key);

  map.set(key, value);

  return value;
}

function getOrInsert(map, key, defaultValue) {
  return getOrInsertComputed(map, key, () => defaultValue);
}

export { getOrInsert, getOrInsertComputed };
