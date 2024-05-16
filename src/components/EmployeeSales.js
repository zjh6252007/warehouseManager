import React from 'react';
import {Table,Button } from 'antd';

const EmployeeSales=({data}) =>{

    const columns = [
        {
          title: 'Top Sales',
          dataIndex: 'salesperson',
          key: 'salesperson',
          render: (text) => <Button type='link'>{text}</Button>,
        },
        {
          title: 'total Sales',
          dataIndex: 'totalSales',
          key: 'totalSales',
          defaultSortOrder:'descend',
          sorter:(a,b)=>a.totalSales - b.totalSales,
          render:(text)=>`$${text.toFixed(2)}`
        }];

      return(
        <Table columns={columns} dataSource={data} />
      )
}

export default EmployeeSales;