import React, { useState, useEffect } from 'react';
import { Bar, Line, Chart } from 'react-chartjs-2';
import './style-graph.css';
import './style-advanced.css';

const YourComponent = () => {
  const [barChart, setBarChart] = useState(null);
  const [lineChart, setLineChart] = useState(null);
  const [minValue, setMinValue] = useState(null);
  const [maxValue, setMaxValue] = useState(null);
  const [resourceAnalysis, setResourceAnalysis] = useState('');
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);

  const handleFile = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const csvData = event.target.result;
        processData(csvData);
      };

      reader.readAsText(file);
    }
  };

  const convertTimeToNumeric = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  };

  const generateColorForValue = (value) => {
    const rangeSize = (maxValue - minValue) / 5;

    const colorRanges = [
      { range: [minValue, minValue + rangeSize], color: 'blue', depiction: 'Least' },
      { range: [minValue + rangeSize, minValue + 2 * rangeSize], color: 'green', depiction: 'Lower' },
      { range: [minValue + 2 * rangeSize, minValue + 3 * rangeSize], color: 'yellow', depiction: 'Low' },
      { range: [minValue + 3 * rangeSize, minValue + 4 * rangeSize], color: 'orange', depiction: 'Higher' },
      { range: [minValue + 4 * rangeSize, maxValue], color: 'red', depiction: 'Highest' }
    ];

    const matchingRange = colorRanges.find(range => value >= range.range[0] && value <= range.range[1]);

    return matchingRange ? matchingRange.color : 'gray';
  };

  const processData = (csvData) => {
    const rows = csvData.split('\n').slice(1);
    const data = rows.map((row, index) => {
      const columns = row.split(',');
      return {
        label: columns[0].trim(),
        value: convertTimeToNumeric(columns[5].trim()),
        order: index
      };
    });

    data.sort((a, b) => a.order - b.order);

    const labels = data.map(item => item.label);
    const values = data.map(item => item.value);

    setLabels(labels);
    setValues(values);
    setMinValue(Math.min(...values));
    setMaxValue(Math.max(...values));

    displayBarGraph(labels, values);
    displayLineGraph(labels, values);
    displayTopValues(labels, values);
    displayResourceAnalysis(labels, values);
  };

  const displayBarGraph = (labels, values) => {
    if (barChart) {
      barChart.destroy();
    }

    const ctx = document.getElementById('barChart').getContext('2d');

    const barColors = values.map(value => generateColorForValue(value));

    const data = {
      labels: labels,
      datasets: [{
        label: 'Data from CSV',
        data: values,
        backgroundColor: barColors,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };

    const options = {
      scales: {
        x: {
          type: 'category',
          labels: labels
        },
        y: {
          beginAtZero: true
        }
      }
    };

    setBarChart(new Chart(ctx, {
      type: 'bar',
      data: data,
      options: options
    }));
  };

  const displayLineGraph = (labels, values) => {
    if (lineChart) {
      lineChart.destroy();
    }

    const ctx = document.getElementById('lineChart').getContext('2d');

    const lineColors = values.map(value => generateColorForValue(value));

    const data = {
      labels: labels,
      datasets: [{
        label: 'Data from CSV',
        data: values,
        fill: false,
        borderColor: lineColors,
        borderWidth: 2
      }]
    };

    const options = {
      scales: {
        x: {
          type: 'category',
          labels: labels
        },
        y: {
          beginAtZero: true
        }
      }
    };

    setLineChart(new Chart(ctx, {
      type: 'line',
      data: data,
      options: options
    }));
  };

  const displayTopValues = (labels, values) => {
    // Your existing code for displaying top values
    // ...
  };

  const displayResourceAnalysis = (labels, values) => {
    // Your existing code for displaying resource analysis
    // ...
  };

  return (
    <div className="dashboard">
      <div className="section">
        <center>
          <h1>Upload a CSV File</h1>
          <label htmlFor="fileInput" className="label-container">
            <span id="fileLabel">Drop Here..</span>
          </label>
          <input type="file" id="fileInput" accept=".csv" onChange={handleFile} />
        </center>
      </div>

      <div className="section">
        <div className="charts-container" style={{ display: 'none' }}>
          <div className="chart">
            <h2>Bar Graph</h2>
            <div className="chart-container">
              <canvas id="barChart"></canvas>
            </div>
          </div>

          <div className="chart">
            <h2>Line Graph</h2>
            <div className="chart-container">
              <canvas id="lineChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Legend</h2>
        <table border="1px">
          <thead>
            <tr>
              <th>Color</th>
              <th>Value Range</th>
              <th>Depiction</th>
            </tr>
          </thead>
          <tbody id="legendTableBody"></tbody>
        </table>
      </div>

      <div className="section">
        <h2>Scale</h2>
        <table border="1px">
          <thead>
            <tr>
              <th>Graph</th>
              <th>X-Axis Scale</th>
              <th>Y-Axis Scale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Bar Graph</td>
              <td id="x-axis-scale-bar">Activities</td>
              <td id="y-axis-scale-bar">Time spent</td>
            </tr>
            <tr>
              <td>Line Graph</td>
              <td id="x-axis-scale-line">Activities</td>
              <td id="y-axis-scale-line">Time spent</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2>Resource Allocation Analysis</h2>
        <p id="resourceAnalysis">{resourceAnalysis}</p>
      </div>

      <div className="section">
        <h2>Top 5 Values</h2>
        <table id="topValuesTable">
          <thead>
            <tr>
              <th>Activities</th>
              <th>Time spent</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  );
};

export default YourComponent;
