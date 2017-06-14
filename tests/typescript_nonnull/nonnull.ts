const foo = (returnNull: boolean = true) => {
  if (returnNull) {
    return Promise.resolve(undefined);
  }
  return Promise.resolve({
    fee: 1
  });
};

const main = async () => {
  const bar = (await foo(false))!;
  console.log(bar.fee);
  
  const fee = (bar)!.fee
  console.log(fee)
};
