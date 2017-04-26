foo(`a long string ${ 1 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 } with expr`);

const x = `a long string ${ 1 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + ( function() {return 3 })() + 3 + 2 + 3 + 2 + 3 } with expr`;

foo(`a long string ${ 1 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + ( function() {
  const x = 5;

  return x;
 })() + 3 + 2 + 3 + 2 + 3 } with expr`);

pipe.write(
  `\n  ${chalk.dim(`\u203A and ${more} more ${more} more ${more} more ${more}`)}`,
);
