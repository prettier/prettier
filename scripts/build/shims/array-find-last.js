const arrayFindLast = (isOptionalObject, array, callback) => {
  if (isOptionalObject && (array === undefined || array === null)) {
    return;
  }

  if (array.findLast) {
    return array.findLast(callback);
  }

  for (let index = array.length - 1; index >= 0; index--) {
    const element = array[index];
    if (callback(element, index, array)) {
      return element;
    }
  }
};

export default arrayFindLast;
