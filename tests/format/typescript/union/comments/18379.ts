type A1 =
  (
    A | B // comment 1
  ) & (
    // comment2
    A | B
  )

type A2 =
  (
  	A | B // prettier-ignore
  ) & (
  	// prettier-ignore
    A | B
  )

// TODO: Fix the following two

// type A1 =
//   (
//     // comment 1
//     A | B
//   ) & (
//   	// comment2
//     A | B
//   )

// type A2 =
//   (
//     // prettier-ignore
//   	A | B
//   ) & (
//   	// prettier-ignore
//     A | B
//   )
