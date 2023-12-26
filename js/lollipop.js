// --------------------------------------
//  Margin and canvas
// --------------------------------------

const margin3 = {top: 50, right: 50, bottom: 50, left:15};
const width3 = 1000;
const height3 = 600;
const innerwidth3 = width3 - margin3.left - margin3.right;
const innerheight3 = height3 - margin3.top - margin3.bottom;

// Append the SVG container
const svg3 = d3.select("#chart3")
  .append("svg")
    .attr("viewBox", `0, 0, ${width3}, ${height3}`);

// Append the group for the inner chart
const innerChart3 = svg3
  .append("g")
    .attr("transform", `translate(${margin3.left}, ${margin3.top})`);

// --------------------------------------
//  Data loading
// --------------------------------------

const data3 = d3.csv("./data/tropical.csv", d3.autoType) 
  .then(function(data3){ 

    // console.log(data3);

// --------------------------------------
//  Formating 
// --------------------------------------

format = d3.format(".03s");

// --------------------------------------
// Tooltip
// --------------------------------------

const tooltip = d3.tip()
    .attr("class", "tooltip")
    .html(
      (event, d) => `<div>${(d.Name)}<br>Year ${(d.Year)}</br>Death ${(d.Deaths)}<br>Damage ${format(d.Costs)}</br></div>`
    );

svg.call(tooltip); 

// --------------------------------------
//  Scales
// --------------------------------------

let x = d3.scaleLinear()
    .domain(d3.extent(data3, d => d.Year))
    .range([0, innerwidth3]);

let y = d3.scaleLinear()
    .domain(d3.extent(data3, d => d.Costs))
    .range([innerheight3, 0]);

let r2 = d3.scaleSqrt()
    .domain(d3.extent(data3, d => d.Deaths))
    .range([0, 50]);

let r1 = d3.scaleSqrt()
    .domain(d3.extent(data3, d => d.Costs))
    .range([0, 50]);

let c = d3.scaleOrdinal()
    .domain(["True", "False"])
    .range(["#ccff99", "white"]);

// --------------------------------------
//  Axes 
// --------------------------------------

innerChart3.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${innerheight3})`)
    .call(d3.axisBottom(x)
        	.tickValues([1980, 1992, 2005, 2012, 2017, 2020, 2022]) 
     		  .tickSize(10)
          .tickPadding(5));

// --------------------------------------
//  Data drawing 
// --------------------------------------

//Lines
innerChart3
    .append("g")
    .selectAll("line")
    .data(data3)
    .join("line")
    .attr("x1", (d) => x(d.Year))
    .attr("x2", (d) => x(d.Year))
    .attr("y1", innerheight3)
    .attr("y2", (d) => y(d.Costs) + r1(d.Costs))
    .attr("stroke", (d) => c(d.Hurricane))
    .attr("stroke-width", 0.5)
    .attr("opacity", 0.7); 

//Circle costs
innerChart3
    .append("g")
    .selectAll(".cost_circle")
    .data(data3)
    .join("circle")
    .attr("class", "cost_circle")   
    .attr("cx", (d) => x(d.Year))
    .attr("cy", (d) => y(d.Costs))
    .attr("r", (d) => r1(d.Costs))
    .attr("fill", (d) => c(d.Hurricane))
    .attr("fill-opacity", 0.87)
    .attr("stroke", (d) => c(d.Hurricane))
    .attr("stroke-opacity", 1)
    .attr("stroke-width", 0.2)
    .on("mouseover", tooltip.show)
    .on("mouseout", tooltip.hide); 

//Circle death
innerChart3
    .append("g")
    .selectAll(".death_circle")
    .data(data3)
    .join("circle")
    .attr("class", "death_circle")   
    .attr("cx", (d) => x(d.Year))
    .attr("cy", (d) => y(d.Costs))
    .attr("r", (d) => r2(d.Deaths))
    .attr("fill", "#FF809B")
    .attr("fill-opacity", 0.3)
    .on("mouseover", tooltip.show)
    .on("mouseout", tooltip.hide); 

//Text 
innerChart3
    .append("g")
    .selectAll("text")
    .data(data3)
    .join("text")
    .filter(d => d.Costs > 60000)
    .attr("x", (d) => x(d.Year))
    .attr("y", (d) => y(d.Costs))
    .attr("class", "super_hurricane")
    .text(d => "🔥 " + d.Name)
    .attr("text-anchor", "middle")
    .on("mouseover", tooltip.show)
    .on("mouseout", tooltip.hide);

// --------------------------------------
//  Legend 
// --------------------------------------

// const formatsInfo = [
//   {id: "hurricane", label: "Hurricane", color: "#ccff99"},
//   {id: "tropical_storm", label: "Tropical storm", color: "white"},
// ];

// const legendItems = d3.select(".legend-container")
//     .append("ul")
//       .attr("class", "color-legend")
//     .selectAll(".color-legend-item")
//     .data(formatsInfo)
//     .join("li")
//       .attr("class", "color-legend-item");

//   legendItems
//     .append("span")
//       .attr("class", "color-legend-item-color")
//       .style("background-color", d => d.color);

//   legendItems
//     .append("span")
//       .attr("class", "color-legend-item-label")
//       .text(d => d.label);

// --------------------------------------
//  Buttons 
// --------------------------------------

const filters = [
  { id: "hurricane", label: "Hurricane", isActive: false,  color: "#ccff99" },
  { id: "tropical_storm", label: "Tropical storm", isActive: false, color: "white" }
];

    d3.select("#filters")
      .selectAll(".filter")
      .data(filters)
      .join("button")
        .attr("class", d => `filter ${d.isActive ? "active" : ""}`)
        .text(d =>d.label)
        .style("background-color", d => d.color)
        .on("click", (e, d) => {
          console.log("DOM event", e);
          console.log("Attached datum", d);

        // If the user clicked on a button that is not yet active
        if (!d.isActive) {

          // Update isActive states in the filters array
          filters.forEach(filter => {
            filter.isActive = d.id === filter.id ? true : false;
          });

          // Handle the buttons active class name
          d3.selectAll(".filter")
          .classed("active", filter => filter.id === d.id ? true : false);

          // Call the function to filter the histogram
          updateChart(d.id, data);


        }

    });


const updateChart = (filterId, data) => {
  
  // Filter the original data based on the selected option
  let updatedData = filterId === "all"
    ? data
    : data.filter(respondent => respondent.gender === filterId);

  // Update the histogram
  d3.selectAll("#histogram rect")
    .data(updatedBins)
    .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr("y", d => yScale(d.length))
      .attr("height", d => innerHeight - yScale(d.length));

};


});