function foo (){
      return (
          a
? looooooooooooooooooooooooooooooooooooooooooooooooooong1
: looooooooooooooooooooooooooooooooooooooooooooooooooong2
      );
}

function foo (){
      return (
          a
? looooooooooooooooooooooooooooooooooooooooooooooooooong1
: looooooooooooooooooooooooooooooooooooooooooooooooooong2
      ).foo;
}

function foo (){
      return (
          a
? looooooooooooooooooooooooooooooooooooooooooooooooooong1
: looooooooooooooooooooooooooooooooooooooooooooooooooong2
      ).foo();
}

// #4976
  const decorated = ((arg, ignoreRequestError) => {
      return (
typeof arg === 'string' || (arg && arg.valueOf && typeof arg.valueOf() === 'string')
? $delegate(arg, ignoreRequestError)
: handleAsyncOperations(arg, ignoreRequestError)).foo();
  });
