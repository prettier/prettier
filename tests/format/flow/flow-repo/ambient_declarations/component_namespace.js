// Test components in declare namespace
declare namespace ComponentNamespace {
  // Ambient component declarations with simple types
  component Card(title: string, content: string);

  component Modal(isOpen: boolean, onClose: () => void);
}

export { ComponentNamespace };
