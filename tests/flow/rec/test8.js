// @flow

let data = [];

function asObjectList(length: number) {
  while (data.length < length) {
    data = data.concat(data);
  }

  let list = [];
  let ii = 0;

  while (ii < length) {
    const record = data[ii];
    list.push({
      id: record.id,
      name: record.name.join(' '),
      value: record.value.join(' '),
    });
    ii++;
  }
  return list;
}
