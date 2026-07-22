// TODO: Use `{Map,WeakMap}#{getOrInsert,getOrInsertComputed}()` directly when available

function getOrInsertComputed(map, key, callback) {
  if (!map.has(key)) {
    const value = callback(key);
    map.set(key, value);
  }

  return map.get(key);
}

function getOrInsert(map, key, defaultValue) {
  return getOrInsertComputed(map, key, () => defaultValue);
}

export { getOrInsert, getOrInsertComputed };
