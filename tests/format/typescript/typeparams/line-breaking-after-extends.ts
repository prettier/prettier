export type OuterType1<
  LongerLongerLongerLongerInnerType extends LongerLongerLongerLongerOtherType<OneMoreType>
> = { a: 1 };

export type OuterType2<
  LongerLongerLongerLongerInnerType extends LongerLongerLongerLongerLongerLongerLongerLongerOtherType
> = { a: 1 };

export type OuterType3<
  LongerLongerLongerLongerInnerType extends LongerLongerLongerLongerLongerLo.ngerLongerLongerOtherType
> = { a: 1 };

export type OuterType4<
  LongerLongerLongerLongerInnerType extends
    | LongerLongerLongerLongerLongerLo
    | ngerLongerLongerOtherType
> = { a: 1 };
