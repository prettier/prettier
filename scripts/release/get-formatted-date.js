// TODO: Implement this in `utils.js` when jest.importActual is landed.
export default function getFormattedDate() {
  const date = new Date();
  const isoStr = date.toISOString();

  const year = isoStr.slice(0, 4);
  const month = isoStr.slice(5, 7);
  const day = isoStr.slice(8, 10);

  return { year, month, day };
}
