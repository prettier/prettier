export default function isTsxFile(options) {
  return options.filepath && /\.tsx$/i.test(options.filepath);
}
