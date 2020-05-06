const err = new TypeError();
const constructor = (typeof err.constructor === 'function') ? err.constructor : Error;
const clone = Object.create(constructor.prototype);
