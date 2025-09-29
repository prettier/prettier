if (foo) { // foo may not exist
  doThing(foo);
}

if (foo)
// foo may not exist
{
  doThing(foo);
}

if (foo) /* foo may not exist */ {
  doThing(foo);
}
