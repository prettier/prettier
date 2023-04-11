export default function isTSXFile(options) {
  return options.filepath && /\.tsx$/i.test(options.filepath);
}
