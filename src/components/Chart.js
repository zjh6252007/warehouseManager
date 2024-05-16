import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useSelector } from 'react-redux';
import moment from 'moment';

const Charts = () => {
  const salesData = useSelector(state => state.sales.salesData);

  // Aggregate sales data by date
  const aggregatedData = salesData.reduce((acc, sale) => {
    const date = moment(sale.createdAt).format('YYYY-MM-DD');
    const totalSaleAmount = (sale.price || 0) + (sale.warrantyPrice || 0);

    if (!acc[date]) {
      acc[date] = { date, totalSales: 0 };
    }
    acc[date].totalSales += totalSaleAmount;

    return acc;
  }, {});

  // Convert the aggregated data object to an array
  const chartData = Object.values(aggregatedData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 10, right: 30, left: 0, bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="totalSales" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Charts;