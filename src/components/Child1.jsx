import { Component } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";
import "./Child1.css";

class Child1 extends Component {
  state = {
    company: "Apple", // Default company
    selectedMonth: "November", // Default month
  };

  componentDidMount() {
    this.updateChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.csv_data !== this.props.csv_data ||
      prevState.company !== this.state.company ||
      prevState.selectedMonth !== this.state.selectedMonth
    ) {
      this.updateChart();
    }
  }

  updateChart() {
    const { csv_data } = this.props;
    const { company, selectedMonth } = this.state;

    if (!csv_data || csv_data.length === 0) return;

    // Filter data based on selected company and month
    const filteredData = csv_data.filter(
      (d) =>
        d.Company === company &&
        d.Date.toLocaleString("default", { month: "long" }) === selectedMonth
    );

    // Set up the D3 chart
    const svg = d3.select("#chart");
    svg.selectAll("*").remove(); // Clear previous chart

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(filteredData, (d) => new Date(d.Date)))
      .range([margin.left, width]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, (d) => Math.min(d.Open, d.Close)),
        d3.max(filteredData, (d) => Math.max(d.Open, d.Close)),
      ])
      .range([height, margin.top]);

    // Add Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Line generators
    const lineOpen = d3
      .line()
      .x((d) => xScale(new Date(d.Date)))
      .y((d) => yScale(d.Open));

    const lineClose = d3
      .line()
      .x((d) => xScale(new Date(d.Date)))
      .y((d) => yScale(d.Close));

    // Plot Lines
    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "#b2df8a")
      .attr("d", lineOpen);

    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "#e41a1c")
      .attr("d", lineClose);

    // Create tooltip div
    const tooltip = d3
      .select("#tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "12px");

    // Add Circles with Tooltip
    svg
      .selectAll(".dot")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(new Date(d.Date)))
      .attr("cy", (d) => yScale(d.Open))
      .attr("r", 5)
      .attr("fill", "#b2df8a")
      .on("mouseover", (e, d) => {
        tooltip.style("visibility", "visible").html(`
            <strong>Date:</strong> ${d.Date.toDateString()}<br/>
            <strong>Open:</strong> $${d.Open}<br/>
            <strong>Close:</strong> $${d.Close}<br/>
            <strong>Difference:</strong> $${(d.Close - d.Open).toFixed(2)}
          `);
      })
      .on("mousemove", (e) => {
        tooltip
          .style("top", `${e.pageY + 10}px`)
          .style("left", `${e.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    svg
      .selectAll(".dot")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(new Date(d.Date)))
      .attr("cy", (d) => yScale(d.Close))
      .attr("r", 5)
      .attr("fill", "#e41a1c")
      .on("mouseover", (e, d) => {
        tooltip.style("visibility", "visible").html(`
            <strong>Date:</strong> ${d.Date.toDateString()}<br/>
            <strong>Open:</strong> $${d.Open.toFixed(2)}<br/>
            <strong>Close:</strong> $${d.Close.toFixed(2)}<br/>
            <strong>Difference:</strong> $${(d.Close - d.Open).toFixed(2)}
          `);
      })
      .on("mousemove", (e) => {
        tooltip
          .style("top", `${e.pageY + 10}px`)
          .style("left", `${e.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    // Legend
    svg
      .append("circle")
      .attr("cx", 750)
      .attr("cy", 20)
      .attr("r", 5)
      .style("fill", "#b2df8a");
    svg
      .append("circle")
      .attr("cx", 750)
      .attr("cy", 40)
      .attr("r", 5)
      .style("fill", "#e41a1c");
    svg
      .append("text")
      .attr("x", 760)
      .attr("y", 20)
      .text("Open")
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", 760)
      .attr("y", 40)
      .text("Close")
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  }

  render() {
    const options = ["Apple", "Microsoft", "Amazon", "Google", "Meta"];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return (
      <div className="child1">
        <div>
          <h3>Select Company:</h3>
          {options.map((company) => (
            <label key={company}>
              <input
                type="radio"
                value={company}
                checked={this.state.company === company}
                onChange={(e) => this.setState({ company: e.target.value })}
              />
              {company}
            </label>
          ))}

          <h3>Select Month:</h3>
          <select
            value={this.state.selectedMonth}
            onChange={(e) => this.setState({ selectedMonth: e.target.value })}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <svg id="chart" width="800" height="400"></svg>
        <div id="tooltip"></div>
      </div>
    );
  }
}
Child1.propTypes = {
  csv_data: PropTypes.array.isRequired,
};

export default Child1;
