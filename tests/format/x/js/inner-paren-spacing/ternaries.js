a => a ? () => { a } : () => { a }

const devOnly = (block) => (!!__DEV__?block:null);

f(result => (result ? result : candidate), 'foobar');

const obj = {
  foo: 'foo',
  bar: 'bar',
  text: () => (typeof text === 'function' ? text() : text),
};
