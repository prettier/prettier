function unionVisitorKeys(visitorKeys) {
  const result = {};

  for (const keys of visitorKeys) {
    for (const [key, value] of Object.entries(keys)) {
      if (!result[key]) {
        result[key] = value;
      } else {
        result[key] = [...new Set([...result[key], ...value])];
      }
    }
  }

  return result;
}

export default unionVisitorKeys;
