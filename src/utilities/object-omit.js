function omit(object, keys) {
  keys = new Set(keys);
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => !keys.has(key)),
  );
}

export default omit;
