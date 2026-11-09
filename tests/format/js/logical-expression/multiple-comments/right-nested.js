const condition = first && (
  // Check the next operand.
  second && third
);

const fallback = first && (
  // Build the fallback.
  second && [third, fourth]
);

const mixed = first && ((
  // Check both operands.
  second && third
) && fourth);
