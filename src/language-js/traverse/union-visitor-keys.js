function unionVisitorKeys(all) {
  const result = {};

  for (const [key, value] of all.flatMap((keys) => Object.entries(keys))) {
    result[key] = [...new Set([...(result[key] ?? []), ...value])];
  }

  return result;
}

export default unionVisitorKeys;
