// test to make sure comments are attached correctly
let inlineComment = /* some comment */ (
  someReallyLongFunctionCall(withLots, ofArguments));

let object = {
  key: /* some comment */ (someReallyLongFunctionCall(withLots, ofArguments))
};

// preserve parens only for type casts
let assignment = /** @type {string} */ (getValue());

functionCall(1 + /** @type {string} */ (value), /** @type {!Foo} */ ({}));

function returnValue() {
  return /** @type {!Array.<string>} */ (['hello', 'you']);
}

var newArray = /** @type {array} */ (numberOrString).map(x => x);
var newArray = /** @type {array} */ ((numberOrString)).map(x => x);
var newArray = /** @type {array} */ ((numberOrString).map(x => x));
