interface MyComponentProps {
  x: number
}

const MyComponent: React.VoidFunctonComponent<MyComponentProps> = ({ x }) => {
  const a = useA()
  return <div>x = {x}; a = {a}</div>
}

interface MyComponent2Props {
  x: number
  y: number
}

const MyComponent2: React.VoidFunctonComponent<MyComponent2Props> = ({ x, y }) => {
  const a = useA()
  return <div>x = {x}; y = {y}; a = {a}</div>
}

interface MyComponentWithLongNameProps {
  x: number
  y: number
  [key: string]: unknown
}

const MyComponentWithLongName: React.VoidFunctonComponent<MyComponentWithLongNameProps> = ({ x, y }) => {
  const a = useA()
  return <div>x = {x}; y = {y}; a = {a}</div>
}

const MyComponentWithLongName: React.VoidFunctonComponent<MyComponentWithLongNameProps> = ({ x, y, anotherPropWithLongName1, anotherPropWithLongName2, anotherPropWithLongName3, anotherPropWithLongName4 }) => {
  const a = useA()
  return <div>x = {x}; y = {y}; a = {a}</div>
}
