"use strict";

function mapObject(object, fn) {
  const newObject = Object.create(null);
  for (const [key, value] of Object.entries(object)) {
    newObject[key] = fn(value, key);
  }
  return newObject;
}

module.exports = mapObject;
