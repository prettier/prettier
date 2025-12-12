/**
@typedef {readonly string[]} Keys
@typedef {Record<string, Keys>} VisitorKeys */

const unique = (values) => [...new Set(values)];

/**
@param {...VisitorKeys} all
@returns {VisitorKeys}
*/
function unionVisitorKeys(...all) {
  /** @type {VisitorKeys} */
  const result = {};

  for (const [type, keys] of all.flatMap((keys) => Object.entries(keys))) {
    result[type] = unique([...(result[type] ?? []), ...keys]);
  }

  return result;
}

/**
@param {VisitorKeys} visitorKeys
@param {VisitorKeys} keysToRemove
@returns {VisitorKeys}
*/
function removeVisitorKeys(visitorKeys, keysToRemove) {
  const result = { ...visitorKeys };

  for (const [type, keys] of Object.entries(keysToRemove)) {
    if (!Object.hasOwn(result, type)) {
      throw new Error(`Node type "${type}" does not exists in visitor keys.`);
    }

    const existing = result[type];
    for (const key of keys) {
      if (!existing.includes(key)) {
        throw new Error(`"${key}" does not exists in "${type}" visitor keys.`);
      }
    }

    result[type] = existing.filter((key) => !keys.includes(key));
  }

  return result;
}

/**
@param {VisitorKeys} visitorKeys
@param {VisitorKeys} keysToAdd
@returns {VisitorKeys}
*/
function addVisitorKeys(visitorKeys, keysToAdd) {
  const result = { ...visitorKeys };

  for (const [type, keys] of Object.entries(keysToAdd)) {
    if (keys.length === 0 && Object.hasOwn(result, type)) {
      throw new Error(`Node type "${type}" already exists in visitor keys.`);
    }

    const existing = [...(result[type] ?? [])];

    for (const key of keys) {
      if (existing.includes(key)) {
        throw new Error(`"${key}" already exists in "${type}" visitor keys.`);
      }
      existing.push(key);
    }

    result[type] = existing;
  }

  return result;
}

/**
@param {VisitorKeys} visitorKeys
@param {string[]} nodeTypesToRemove
@returns {VisitorKeys}
*/
function removeNodeTypes(visitorKeys, nodeTypesToRemove) {
  const result = { ...visitorKeys };

  for (const type of nodeTypesToRemove) {
    if (!Object.hasOwn(result, type)) {
      throw new Error(`Node type "${type}" does not exists in visitor keys.`);
    }

    delete result[type];
  }

  return result;
}

/**
@param {VisitorKeys} visitorKeys
@returns {VisitorKeys}
*/
function generateReferenceSharedVisitorKeys(visitorKeys) {
  /** @type {Map<string, Keys>} */
  const cache = new Map();
  /** @type {VisitorKeys} */
  const result = {};

  for (const [type, keys] of Object.entries(visitorKeys)) {
    const cacheKey = keys.toSorted().join("\0");
    if (!cache.has(cacheKey)) {
      cache.set(cacheKey, keys);
    }
    result[type] = cache.get(cacheKey);
  }

  return result;
}

export {
  addVisitorKeys,
  generateReferenceSharedVisitorKeys,
  removeNodeTypes,
  removeVisitorKeys,
  unionVisitorKeys,
};
