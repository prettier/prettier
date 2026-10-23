function foo() {
  before();
  firstCondition && secondCondition && thirdCondition ? yes() : no();
}

switch (condition) {
  case 1:
    before();
    firstCondition && secondCondition && thirdCondition ? yes() : no();
}

class Foo {
  static {
    before();
    firstCondition && secondCondition && thirdCondition ? yes() : no();
  }
}

if (condition)
  firstCondition && secondCondition && thirdCondition ? yes() : no();

while (condition)
  firstCondition && secondCondition && thirdCondition ? yes() : no();

do
  firstCondition && secondCondition && thirdCondition ? yes() : no();
while (condition);

label:
  firstCondition && secondCondition && thirdCondition ? yes() : no();
