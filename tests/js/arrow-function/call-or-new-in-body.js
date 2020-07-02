() => foo({
key: value});

() => foo?.bar({
key: value});

() => new Foo({
key: value});

const a1 = () => new Foo({
key: value});

call(() => foo({
key: value}));

call(() => new Foo({
key: value}));

call(() => foo({
key: value}), second);

call(() => new Foo({
key: value}), second);

x?.call(() => foo({
key: value}));

x?.call(() => new Foo({
key: value}));

[() => foo({
key: value}), second];

[() => new Foo({
key: value}), second];

a = {b: () => foo({
key: value})};

a = {b: () => new Foo({
key: value})};

a = () => foo({
key: value});

a = () => new Foo({
key: value});

function a() {return () => foo({
key: value});}
function a() {return () => new Foo({
key: value});}

const {a1 = () => foo({
key: value})} = {}

const {a2 = () => new Foo({
key: value})} = {}

loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog = () => foo({
key: value});

loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog = () => new Foo({
key: value});

a = () => loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog({
key: value});

a = () => new loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog({
key: value});

(loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog) => foo({
key: value});

(loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog) => new Foo({
key: value});

a = (greeting = "hello", greeted = '"World"', silent = false, onMouseOver) => foo({
key: value});

a = ({greeting = "hello", greeted = '"World"', silent = false, onMouseOver}) => foo({
key: value});

// #5733
expect(
  () => new GraphQLObjectType({
      field1: 'foo',
      field2: 'bar'
  })
);
() => new GraphQLObjectType({
  field1: 'foo',
  field2: 'bar'
});
new Foo(
  () => new FooBar({
    field1: 1,
    field2: 2
  })
);
() =>  foo({
  bar,
});
