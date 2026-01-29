with(
    foo
    // 1
  ) {}

with(foo)// 2
{}

with(foo){}// 3

with(foo)/*4*/{}

with(
  foo // 5
  ?? bar // 52
  ){}

with(foo) {} // 53

with(foo) /* 54 */ ++x;

with(1) // 55
  foo();
