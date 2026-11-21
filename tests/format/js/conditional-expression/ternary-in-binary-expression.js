// Ternary as operand of binary expression - closing paren should break
const a3 =
  (funnelSnapshotCard
    ? loremInpsumDolorSitAmetConsectetur()
    : somethingElseWithReallyLongMeaninglessName()) + 100;

// Ternary nested inside binary expression operand - should not be worse
const a4 =
  100 +
  ((funnelSnapshotCard
    ? loremInpsumDolorSitAmetConsectetur()
    : somethingElseWithReallyLongMeaninglessName()) +
    100);

// Ternary as left operand
const leftOp =
  (condition ? longConsequentThatBreaksLine : alternate) + other;

// Ternary as right operand
const rightOp =
  other + (condition ? longConsequentThatBreaksLine : alternate);

// Ternary as left operand with subtraction
const subLeft =
  (condition ? consequent : alternate) - other;

// Ternary as left operand with multiplication
const mulLeft =
  (condition ? consequent : alternate) * other;

// Ternary as left operand with logical operators
const logicalLeft =
  (condition ? consequent : alternate) && other;

const logicalOrLeft =
  (condition ? consequent : alternate) || other;

// Short ternary that should NOT break
const short = (condition ? a : b) + 100;

// Ternary with comments
const comment =
  (
    condition ? consequent : alternate // comment
  ) + other;

// Angular pipe case (from original issue)
const angularPipe =
  (isCustomDiscount
    ? "DISCOUNTS__DISCOUNT_TRAINING_HEADER__CUSTOM_DISCOUNT"
    : "DISCOUNTS__DISCOUNT_TRAINING_HEADER__DISCOUNT") | translate;
