// Generic arrow function in .ts file should NOT have trailing comma
const fn1 = <T>(something: string, list: T[]) => list;
const fn2 = <T>(value: T) => value;

export class BaseSingleLevelProfileTargeting<
	T extends ValidSingleLevelProfileNode,
> {
}

enum Enum {
	x = 1,
	y = 2,
}

const {
  longKeySoThisWillGoOnMultipleLines,
  longKeySoThisWillGoOnMultipleLines2,
  longKeySoThisWillGoOnMultipleLines3,
  ...rest,
} = something;
