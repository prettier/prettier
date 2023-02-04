
type A1 =
  | (
    | (
      | {
          key: string;
        }
    )
  );
type A2 =
  | (
    | {
        key: string;
      }
    | {
        key: number;
      }
  );
type A3 =
  | ( | {
    key: string;
  } );
type A4 =
  | ( | ( | {
    key: string;
  } ) );
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
    | {
      key: string;
    }
  )
  );

type B1 =
  | (
    & (
      {
        value: string;
      }
    )
  );
type B2 =
  | (
    & (
      | (
        & (
          {
            value: string;
          }
        )
      )
    )
  );
