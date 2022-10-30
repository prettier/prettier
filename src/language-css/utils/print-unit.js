import CSS_UNITS from "./css-units.evaluate.js";

function printUnit(unit) {
  const lowercased = unit.toLowerCase();

  return CSS_UNITS.has(lowercased) ? CSS_UNITS.get(lowercased) : unit;
}

export default printUnit;
