const arrayFindLastIndex = (isOptionalObject, array, callback) => {
  if (isOptionalObject && (array === undefined || array === null)) {
    return;
  }

  if (array.findLastIndex) {
    return array.findLastIndex(callback);
  }

  for (let index = array.length - 1; index >= 0; index--) {
    const element = array[index];
    if (callback(element, index, array)) {
      return index;
    }
  }

  return -1;
};

export default arrayFindLastIndex;
