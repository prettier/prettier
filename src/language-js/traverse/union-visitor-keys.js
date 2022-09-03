function unionVisitorKeys(all) {
  const result = {};

  for (const [type, keys] of all.flatMap((keys) => Object.entries(keys))) {
    result[type] = [...new Set([...(result[type] ?? []), ...keys])];
  }

  return result;
}

export default unionVisitorKeys;
