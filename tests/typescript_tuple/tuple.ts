
export type SCMRawResource = [
	number /*handle*/,
	string /*resourceUri*/,
	modes.Command /*command*/,
	string[] /*icons: light, dark*/,
	boolean /*strike through*/,
	boolean /*faded*/
];

type TupleWithOptional = [number, (1 extends 2 ? string[] : number[])?]
type TupleWithRest = [number, ...(1 extends 2 ? string[] : number[])];
