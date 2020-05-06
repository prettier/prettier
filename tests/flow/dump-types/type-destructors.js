// @flow

type T<X> = $Shape<{ f: X }>;

type Props = { name: string, age: number };
type DefaultProps = { age: number };
declare var diff: $Diff<Props, DefaultProps>;
diff.name; // this is required for the type to actually be evaluated
