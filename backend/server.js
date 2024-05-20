const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 5000;

app.use(cors());

// Load the data from the CSV file
const csvFilePath = path.join(__dirname, "salaries.csv");
const csv = fs.readFileSync(csvFilePath, "utf-8");

// Parse the CSV data
const parseCSV = (csv) => {
  const lines = csv.split("\n");
  const headers = lines[0].split(",");
  return lines
    .slice(1)
    .map((line) => {
      const data = line.split(",");
      return headers.reduce((obj, header, index) => {
        if (data[index] !== undefined) {
          obj[header.trim()] = data[index].trim();
        } else {
          obj[header.trim()] = null;
        }
        return obj;
      }, {});
    })
    .filter((row) => Object.keys(row).length > 0);
};

const data = parseCSV(csv);

// API endpoint to get the processed data
app.get("/api/salaries", (req, res) => {
  const groupedByYear = data.reduce((acc, curr) => {
    const year = curr.work_year;
    if (!acc[year]) {
      acc[year] = { year, totalJobs: 0, totalSalary: 0 };
    }
    acc[year].totalJobs += 1;
    acc[year].totalSalary += parseFloat(curr.salary_in_usd) || 0;
    return acc;
  }, {});

  const result = Object.values(groupedByYear).map((item) => ({
    year: item.year,
    totalJobs: item.totalJobs,
    averageSalary: item.totalSalary / item.totalJobs,
  }));

  res.json(result);
});

// API endpoint to get job titles aggregated by year
app.get("/api/job-titles/:year", (req, res) => {
  const year = req.params.year;
  const jobTitles = data
    .filter((d) => d.work_year === year)
    .reduce((acc, curr) => {
      const jobTitle = curr.job_title;
      if (!acc[jobTitle]) {
        acc[jobTitle] = { jobTitle, count: 0 };
      }
      acc[jobTitle].count += 1;
      return acc;
    }, {});

  const result = Object.values(jobTitles);
  res.json(result);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
