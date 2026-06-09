fn = (a: number): (?(string => string)) => {
  return a > 0 ? s => `${s}: ${a}` : null;
};

fn = (a: number): ?((string => string)) => {
  return a > 0 ? s => `${s}: ${a}` : null;
};

fn = (): ?number => 1;
