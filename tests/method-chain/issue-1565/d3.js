// https://github.com/prettier/prettier/issues/1565#issue-227278195
d3
  .select("body")
  .selectAll("p")
  .data([1, 2])
  .enter()
  .style("color", "white");

d3
  .select("body")
  .selectAll("p")
  .data([1, 2, 3])
  .enter()
  .style("color", "white");

// https://github.com/prettier/prettier/issues/1565#issuecomment-300133602
point().x(4).y(3).z(6).plot();
point()
  .x(4)
  .y(3)
  .z(6)
  .plot();

// https://github.com/prettier/prettier/issues/1565#issuecomment-305208956
d3.select("body").selectAll("p").data([1, 2]).enter().style("color", "white");
d3.select("body").selectAll("p")
  .data([1, 2])
  .enter()
  .style("color", "white");
d3
  .select("body")
  .selectAll("p")
  .data([1, 2])
  .enter()
  .style("color", "white");
