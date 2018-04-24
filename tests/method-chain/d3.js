d3.select('body')
  .append('circle')
  .at({ width: 30, fill: '#f0f' })
  .st({ fontWeight: 600 })

d3.scaleLinear()
  .domain([1950, 1980])
  .range([0, width])

