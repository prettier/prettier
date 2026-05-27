function getOrInsertComputed(map, key, callback) {
  if (!map.has(key)) {
    const value = callback(key);
    map.set(key, value);
  }

  return map.get(key);
}

function getOrInsert(map, key, defaultValue) {
  if (!map.has(key)) {
    map.set(key, defaultValue);
  }

  return defaultValue;
}

export { getOrInsert, getOrInsertComputed };
