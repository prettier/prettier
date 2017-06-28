// Strawman: revised definition of $jsx (alternatively, React$Element).
// Using bounded poly to specify a constraint on a type parameter, and
// existentials to elide type arguments.
type _ReactNode<DefaultProps, Props, Config: $Diff<Props, DefaultProps>, C: React$Component<DefaultProps, Props, any>> = React$Node<Config>;
type $jsx<C> = _ReactNode<*, *, *, C>;
