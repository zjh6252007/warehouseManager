
import React from 'react';
import { Col,Statistic } from 'antd';
import CountUp from 'react-countup';

const TotalSales = ({title,value}) =>{
    const formatter = (value) => <CountUp end={value} separator="," />;
    return(
    <Col span={12}>
      <Statistic title={title} value={value} formatter={formatter} prefix="$"/>
    </Col>
    )
};

export default TotalSales;