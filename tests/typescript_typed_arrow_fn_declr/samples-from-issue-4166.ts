const myCurriedFn: (arg1: number) => (arg2: number) => (arg3: number) => number = arg1 => arg2 => arg3 => arg1 + arg2 + arg3;

const myCurriedFn2
  : (longNameFirstArgument: LongFirstType) =>
      (longNameSecondArgument: LongSecondType) =>
        (longNameThirdArgument: LongThirdType) =>
          LongReturnType
  = a => b => c => a + b + c;

const myCurriedFn3
  : (longNameFirstArgument: LongFirstType) =>
      (longNameSecondArgument: LongSecondType) =>
        (longNameThirdArgument: LongThirdType) =>
          LongReturnType
  = longFirstParameter => longSecondParameter => longThirdParameter =>
      longFirstParameter + longSecondParameter + longThirdParameter;

const myCurriedFn4
  : (longNameFirstArgument: LongFirstType) =>
      (longNameSecondArgument: LongSecondType) =>
        (longNameThirdArgument: LongThirdType) =>
          LongReturnType
  = (longFirstParameter: LongFirstType) =>
      (longSecondParameter: LongSecondType) =>
        (longThirdParameter: LongThirdType): LongReturnType =>
          longFirstParameter + longSecondParameter + longThirdParameter;
