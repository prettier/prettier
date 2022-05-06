import CSS_UNITS from "./css-units.evaluate.js";

function printUnit(unit) {
  const lowercased = unit.toLowerCase();

  return Object.prototype.hasOwnProperty.call(CSS_UNITS, lowercased)
    ? CSS_UNITS[lowercased]
    : unit;
}

export default printUnit;
