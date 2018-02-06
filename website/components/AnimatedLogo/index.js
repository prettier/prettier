"use strict";

const React = require("react");
const h = React.createElement;
const data = require("./data.json");

const Line = props =>
  h(
    "g",
    { className: `l${props.index}` },
    props.dashes.map(({ color }, j) =>
      h("path", {
        key: j,
        d: `m 5 ${props.index * 20 + 5} l ${props.total} 0`,
        className: ["dash", `p${j}`, `c${color}`].join(" ")
      })
    )
  );

const AnimatedLogo = () => {
  const height = data.lines.length * 20 + 10;
  const width = data.total + 20;
  return h(
    "svg",
    {
      height: height,
      width: width,
      id: "logo",
      viewbox: `0 0 ${height} ${width}`,
      className: "animatedLogo initial",
      version: "1.1"
    },
    data.lines.map(({ dashes }, index) =>
      h(Line, { key: index, total: data.total, dashes: dashes, index })
    )
  );
};

module.exports = AnimatedLogo;
