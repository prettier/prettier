if (firstTrue())
  // doSomething
  doSomething();
else
  // comment after else
  doSomethingElse();

if (firstTrue())
  // doSomething
  doFirstThing();
else if (secondTrue())
  // comment
  doSecondThing();
else
  // comment after else
  doThirdThing();

if (firstTrue())
  // doSomething
  doSomething();
// comment before else
else doSomethingElse();

if (firstTrue())
  // doSomething
  doSomething();
else
  // comment after else
  // another comment after else
  doSomethingElse();

if (firstTrue())
  // doSomething
  doSomething();
else
  /*
   * block comment after else
   */
  // another comment after else
  doSomethingElse();

if (firstTrue())
  // doSomething
  doSomething();
else
  /* inline comment after else */
  // another comment after else
  doSomethingElse();
