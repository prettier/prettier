if (1) { // foo may not exist
  doThing(foo);
}
if (1){}else { // foo may not exist
  doThing(foo);
}

if (2)
// foo may not exist
{
  doThing(foo);
}
if (2){}else
// foo may not exist
{
  doThing(foo);
}

if (3)// foo may not exist
{
  doThing(foo);
}
if (3){}else// foo may not exist
{
  doThing(foo);
}

if (4)/* foo may not exist */{
  doThing(foo);
}
if (4){}else/* foo may not exist */{
  doThing(foo);
}
