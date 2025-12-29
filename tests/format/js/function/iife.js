[
  (// leading 1
  function () {})(),
  (// leading 2
  function () {})?.(),
  (/*block 1*/
  function () {})(),
  (function () {}
  // trialing 1
  )(),
  (function () {}
  // block 2
  )(),
  (// prettier-ignore
  function () {      })(),
  (function () {}/* trialing 2 */)(),


  (// leading 1
  () => {})(),
  (// leading 2
  () => {})?.(),
  (/*block 1*/
  () => {})(),
  (() => {}
  // trialing 1
  )(),

  ((/*dangling 1*/) =>{})(),
  ( () => {}/* trialing 2 */)(),

  (/* not a comment for function */function() {}()),
]
