import React from 'react';
import { Table, Button } from 'antd';

const EmployeeSales = ({ data }) => {
  // 数据预处理：将销售员的名字统一为小写，并累加同一个销售员的销售额
  const processedData = data.reduce((acc, item) => {
    // 统一小写处理
    const salesperson = item.salesperson.toLowerCase();
    // 如果已存在，则累加销售额；否则，添加新记录
    if (acc[salesperson]) {
      acc[salesperson].totalSales += item.totalSales;
    } else {
      acc[salesperson] = {
        key: salesperson, // 确保有唯一的key值
        salesperson: item.salesperson, // 保留原始格式用于显示
        totalSales: item.totalSales
      };
    }
    return acc;
  }, {});

  // 将对象转换回数组格式以供表格使用
  const dataSource = Object.values(processedData);

  const columns = [
    {
      title: 'Top Sales',
      dataIndex: 'salesperson',
      key: 'salesperson',
      render: (text) => <Button type='link'>{text}</Button>,
    },
    {
      title: 'Total Sales',
      dataIndex: 'totalSales',
      key: 'totalSales',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.totalSales - b.totalSales,
      render: (text) => `$${text.toFixed(2)}`
    }
  ];

  return (
    <Table columns={columns} dataSource={dataSource} />
  );
}

export default EmployeeSales;
