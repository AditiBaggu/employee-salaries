import React, { useEffect, useState } from "react";
import { Table, Card, Row, Col, Typography} from "antd";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import './App.css'; // Assuming you create a CSS file for custom styles

const { Title } = Typography;

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  useEffect(() => {
    axios
      .get("https://employee-salaries.onrender.com/api/salaries")
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
        setLoading(false);
      });
  }, []);

  const fetchJobTitles = async (year) => {
    try {
      const response = await axios.get(
        `https://employee-salaries.onrender.com/api/job-titles/${year}`
      );
      return response.data;
    } catch (error) {
      console.error("There was an error fetching the job titles!", error);
      return [];
    }
  };

  const handleExpand = async (expanded, record) => {
    if (expanded) {
      const jobTitles = await fetchJobTitles(record.year);
      const newData = data.map((item) => {
        if (item.year === record.year) {
          return { ...item, jobTitles };
        }
        return item;
      });
      setData(newData);
      setExpandedRowKeys([record.year]);
    } else {
      setExpandedRowKeys([]);
    }
  };

  const columns = [
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: "Number of Total Jobs",
      dataIndex: "totalJobs",
      key: "totalJobs",
      sorter: (a, b) => a.totalJobs - b.totalJobs,
    },
    {
      title: "Average Salary (USD)",
      dataIndex: "averageSalary",
      key: "averageSalary",
      sorter: (a, b) => a.averageSalary - b.averageSalary,
      render: (text) => `$${text.toFixed(2)}`,
    },
  ];

  const jobTitleColumns = [
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <Table
        columns={jobTitleColumns}
        dataSource={record.jobTitles}
        rowKey="jobTitle"
        pagination={false}
      />
    );
  };

  return (
    <div className="app-container">
      <Title level={1} className="main-title">ML Engineer Salaries</Title>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Salaries Overview" className="card">
            <Table
              columns={columns}
              dataSource={data}
              rowKey="year"
              loading={loading}
              expandable={{
                expandedRowRender,
                expandedRowKeys,
                onExpand: handleExpand,
              }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Average Salary Over Time" className="card">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="averageSalary"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default App;
