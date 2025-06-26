const e = match (x) {
  [10] => 1,
  [const y, 1] => y,
  [1, ...] => 1,
  [1, 2, ...const rest] => rest,
  [...let rest] => rest,
  [...var rest] => rest,
  [{nested: [1, const x]}] => x,
};
