// Shouldn't break

it("does something really long and complicated so I have to write a very long name for the test", () => {
  console.log("hello!");
});

it("does something really long and complicated so I have to write a very long name for the test", function() {
  console.log("hello!");
});

it("does something really long and complicated so I have to write a very long name for the test", function(done) {
  console.log("hello!");
});

it("does something really long and complicated so I have to write a very long name for the test", function myAssertions(done) {
  console.log("hello!");
});

it(`does something really long and complicated so I have to write a very long name for the test`, function() {
  console.log("hello!");
});

it(`{foo + bar} does something really long and complicated so I have to write a very long name for the test`, function() {
  console.log("hello!");
});

it(`handles
  some
    newlines
  does something really long and complicated so I have to write a very long name for the test`, () => {
  console.log("hello!");
})

test("does something really long and complicated so I have to write a very long name for the test", (done) => {
  console.log("hello!");
});

test(`does something really long and complicated so I have to write a very long name for the test`, (done) => {
  console.log("hello!");
});

test("does something really long and complicated so I have to write a very long name for the test", <T>(done) => {
  console.log("hello!");
});

describe("does something really long and complicated so I have to write a very long name for the describe block", () => {
  it("an example test", (done) => {
    console.log("hello!");
  });
});

describe(`does something really long and complicated so I have to write a very long name for the describe block`, () => {
  it(`an example test`, (done) => {
    console.log("hello!");
  });
});

xdescribe("does something really long and complicated so I have to write a very long name for the describe block", () => {});

fdescribe("does something really long and complicated so I have to write a very long name for the describe block", () => {});

describe.only(`does something really long and complicated so I have to write a very long name for the test`, () => {});

describe.skip(`does something really long and complicated so I have to write a very long name for the test`, () => {});

fit("does something really long and complicated so I have to write a very long name for the describe block", () => {});

xit("does something really long and complicated so I have to write a very long name for the describe block", () => {});

it.only("does something really long and complicated so I have to write a very long name for the test", () => {
  console.log("hello!");
});

it.only(`does something really long and complicated so I have to write a very long name for the test`, () => {
  console.log("hello!");
});

it.skip(`does something really long and complicated so I have to write a very long name for the test`, () => {});

test.only(`does something really long and complicated so I have to write a very long name for the test`, () => {});

test.skip(`does something really long and complicated so I have to write a very long name for the test`, () => {});

ftest("does something really long and complicated so I have to write a very long name for the describe block", () => {});

xtest("does something really long and complicated so I have to write a very long name for the describe block", () => {});

// Should break

it.only("does something really long and complicated so I have to write a very long name for the test", 10, () => {
  console.log("hello!");
});

it.only.only("does something really long and complicated so I have to write a very long name for the test", () => {
  console.log("hello!");
});

it.only.only("does something really long and complicated so I have to write a very long name for the test", (a, b, c) => {
  console.log("hello!");
});
