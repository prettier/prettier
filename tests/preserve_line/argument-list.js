longArgNamesWithComments(

  // Hello World

  longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong1,

  // Hello World

  longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong2,

  /* Hello World */
  longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong3,


);

shortArgNames(


  short,

  short2,
  short3,
);

comments(

  // Comment

  /* Some comments */
  short,
  /* Another comment */


  short2, // Even more comments


  /* Another comment */


  // Long Long Long Long Long Comment



  /* Long Long Long Long Long Comment */
  // Long Long Long Long Long Comment

  short3,
  // More comments


);

differentArgTypes(

  () => {
    return true
  },

  isTrue ?
    doSomething() : 12,

);

moreArgTypes(

  [1, 2,
    3],

  {
    name: 'Hello World',
    age: 29
  },

  doSomething(

    // Hello world


    // Hello world again
    { name: 'Hello World', age: 34 },


    oneThing
      + anotherThing,

    // Comment

  ),

);

evenMoreArgTypes(
  doSomething(
    { name: 'Hello World', age: 34 },


    true

  ),

  14,

  1 + 2
    - 90/80,

  !98 *
    60 -
    90,



)
