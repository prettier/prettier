//@flow

function mergeNumsError<T: number>(
  defaultNumber: T,
  ...nums: Array<number>
): T {
  return nums.reduce<T>(
    ((prevnum, curnum) => curnum + prevnum),
    defaultNumber
  )
}

var x: 42 = mergeNumsError(42, 90, 90);
