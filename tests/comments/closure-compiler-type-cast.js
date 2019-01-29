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


const data = functionCall(
  arg1,
  arg2,
  /** @type {{height: number, width: number}} */ (arg3));

// Invalid type casts
const v = /** @type {} */ (value);
const v = /** @type {}} */ (value);
const v = /** @type } */ (value);
const v = /** @type { */ (value);
const v = /** @type {{} */ (value);

const style = /** @type {{
  width: number,
  height: number,
  marginTop: number,
  marginLeft: number,
  marginRight: number,
  marginBottom: number,
}} */ ({
  width,
  height,
  ...margins,
});
