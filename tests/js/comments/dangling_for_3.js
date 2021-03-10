for(
  ; // no init!
  i > 0;
  i++
) {}

for(
  /* j = 10 */; // no init
  j > 0; // test
  // no update
) {}

for(
  // a
  /* k = 10 */; // no init
  // b
  k > 0; // test
  /* k++ */ // no update
) {}

for(
  // a
  /* m = 10 */; // no init
  // b
  m > 0 /* (!) */; // test
  // c
  /* m++ */ // no update
) {}

for(
  // a
  /* m = 10 */; // no init
  // b
  m > 0 /* (!) */; // test
  // c
  /* 1 */ /* 2 */
  /* m++ */ // no update
  /* n++ */ // no update2

  // d
) {}

