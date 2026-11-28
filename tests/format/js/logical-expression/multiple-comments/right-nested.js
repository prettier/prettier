x = first && (
  // Check the next operand.
  second && third
);

x = first && (
  // Build the fallback.
  second && [third, fourth]
);

x = first && ((
  // Check both operands.
  second && third
) && fourth);
