before();
firstCondition && secondCondition && thirdCondition ? yes() : no();

before();
condition ? yes() : no();

before();
condition ? veryLongConsequent() : veryLongAlternate();

before();
(firstCondition, secondCondition, thirdCondition) ? yes() : no();

before();
[firstCondition, secondCondition, thirdCondition] ? yes() : no();

before();
(firstCondition && secondCondition && thirdCondition ? yes() : no()), after();

before();
first(), (firstCondition && secondCondition && thirdCondition ? yes() : no());

before();
(firstCondition && secondCondition && thirdCondition ? yes() : no()) ? yes() : no();

before();
condition ? yes() : firstCondition && secondCondition && thirdCondition ? yes() : no();

before();
// Leading comment
firstCondition && secondCondition && thirdCondition ? yes() : no();
