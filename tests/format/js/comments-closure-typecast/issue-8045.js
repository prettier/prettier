const myLongVariableName = /** @type {ThisIsAVeryLongTypeThatShouldTriggerLineWrapping} */ (fooBarBaz);

function jsdocCastInReturn() {
  return /** @type {ThisIsAVeryLongTypeThatShouldTriggerLineWrapping} */ (fooBarBaz);
}

const myLongVariableName = /** @type {ThisIsAVeryLongTypeThatShouldTriggerLineWrapping} */
      (fooBarBaz);

function jsdocCastInReturn() {
  return (/** @type {ThisIsAVeryLongTypeThatShouldTriggerLineWrapping} */
    (fooBarBaz));
}

const myLongVariableName = /** @type {ThisIsAVeryLongTypeThatShouldTriggerLineWrapping} */
      (fooBarBaz);

function jsdocCastInReturn() {
  return (/** @type {ThisIsAVeryLongTypeThatShouldTriggerLineWrapping} */
    (fooBarBaz));
}
