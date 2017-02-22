const version = someLongString
  .split('jest version =')
  .pop()
  .split(EOL)[0]
  .trim();
