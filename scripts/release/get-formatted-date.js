// TODO: Implement this in `utilities.js` when jest.importActual is landed.
export default function getFormattedDate() {
  const date = new Date();
  const isoString = date.toISOString();

  const year = isoString.slice(0, 4);
  const month = isoString.slice(5, 7);
  const day = isoString.slice(8, 10);

  return { year, month, day };
}
