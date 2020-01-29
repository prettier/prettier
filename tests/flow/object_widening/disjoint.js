//@flow
type Disjoint = {| t: 'a' |}  | {| t: 'b' |};
declare var obj: {| o: Disjoint |};
const y: Disjoint = {...obj.o}; // Ok!
