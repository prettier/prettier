const arrayToReversed = (isOptionalObject, array) => {
  if (isOptionalObject && (array === undefined || array === null)) {
    return;
  }

  if (array.toReversed || !Array.isArray(array)) {
    return array.toReversed();
  }

  return [...array].reverse();
};

export default arrayToReversed;
