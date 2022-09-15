const at = (object, index) =>
  object.at
    ? object.at(index)
    : object[index < 0 ? object.length + index : index];

export default at;
