array.filter((element, index) =>
  element.field.some(someVeryLongPredicateFunction)
);

array.filter(
  (el, index) => somePredicate(index) && el.field.some(someLongPredicate)
);
