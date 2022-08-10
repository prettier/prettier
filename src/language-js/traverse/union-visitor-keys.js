function unionVisitorKeys(all) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("unionVisitorKeys should not be used in bundled code.")
  }

  const result = {};

  for (const [key, value] of all.flatMap((keys) => Object.entries(keys))) {
    result[key] = [...new Set([...(result[key] ?? []), ...value])];
  }

  return result;
}

export default unionVisitorKeys;
