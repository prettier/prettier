// Declare module with ambient components
declare module 'component-library' {
  component Button(label: string);
  component Icon(name: string);

  declare export { Button, Icon };
}
