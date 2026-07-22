const hasOwn =
  Object.hasOwn ??
  Function.prototype.call.bind(Object.prototype.hasOwnProperty);

export default hasOwn;
