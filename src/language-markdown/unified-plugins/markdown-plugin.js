export function markdownPlugin(micromarkExtension, mdastExtension) {
  return function () {
    const data = this.data();
    (data.micromarkExtensions ||= []).push(micromarkExtension);
    (data.fromMarkdownExtensions ||= []).push(mdastExtension);
  };
}
