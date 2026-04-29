type WriteonlyObj = {
    writeonly   foo:   string,
  writeonly [string]:   unknown
};

type WriteonlyReservedWords = {
  writeonly   with:   string,
  writeonly   default?:   string,
};
