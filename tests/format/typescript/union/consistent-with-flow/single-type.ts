type A1 =
  | (
    | (
      | (
          & A
          // A comment to Break
          & B
        )
    )
  );
type A2 =
  | (
    | (
          & A
          // A comment to Break
          & B
        )
    | (
          & A
          // A comment to Break
          & B
        )
  );
type A3 =
  | ( | (
          & A
          // A comment to Break
          & B
        ) );
type A4 =
  | ( | ( | (
          & A
          // A comment to Break
          & B
        ) ) );
type A5 =
  | (
    | (
      | { key: string }
      | { key: string }
      | { key: string }
      | { key: string }
    )
    | { key: string }
    | { key: string }
  );
type A6 = | (
  /*1*/ | (
    | (
          & A
          // A comment to Break
          & B
        )
  )
  );

type B1 =
  | (
    & (
      (
          & A
          // A comment to Break
          & B
        )
    )
  );
type B2 =
  | (
    & (
      | (
        & (
          (
          & A
          // A comment to Break
          & B
        )
        )
      )
    )
  );
