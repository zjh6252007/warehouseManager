import * as React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import { DatePicker, Row, Col } from 'antd';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { getSalesByDate } from '../redux/modules/sales';
import TotalSales from '../components/TotalSales';
import { getInventoryById } from '../redux/modules/inventory';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import EmployeeSales from '../components/EmployeeSales';
import Charts from '../components/Chart';

const Reports = () => {
  const dispatch = useDispatch();
  const { storeId } = useParams();
  const location = useLocation();
  const isStorePage = location.pathname.includes('/mystore');
  
  useEffect(() => {
    if(isStorePage){
    dispatch(getInventoryById(storeId));
    }
    const dateRange = {
      start: moment().format('YYYY-MM-DDTHH:mm:ss'),
      end: moment().format('YYYY-MM-DDTHH:mm:ss')
    };
    dispatch(getSalesByDate(dateRange,storeId));
  }, [dispatch, storeId]);

  const inventory = useSelector(state => state.inventory.inventoryList);

  const handleChange = (dates, dateStrings) => {
    if (dates) {
      const dateRange = {
        start: moment(dateStrings[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
        end: moment(dateStrings[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ss')
      };
      dispatch(getSalesByDate(dateRange, storeId));
    }
  };

  const salesData = useSelector(state => state.sales.salesData);
  const totalSales = salesData.reduce((total, sale) => {
    return total + (sale.price || 0) + (sale.warrantyPrice || 0);
  }, 0);

  
  const costData = inventory.reduce((cost, inventory) => {
    return cost + (inventory.cost || 0);
  }, 0);

  const totalTax = salesData.reduce((total,sale)=>{
    return total + (sale.taxes || 0);
  },0)

  const revenue = salesData.reduce((total, sale) => {
    if (sale.type === 'Accessory') {
      return total + (sale.price || 0);
    }
    const inventoryItem = inventory.find(item => item.sku === sale.serialNumber);
    if (inventoryItem) {
      const profit = (sale.price || 0) - (inventoryItem.cost || 0) - (sale.taxes||0);
      return total + profit;
    }
    return total;
  }, 0);


  const salesBySalesperson = salesData.reduce((acc, sale) => {
    if (!acc[sale.salesperson]) {
      acc[sale.salesperson] = 0;
    }
    acc[sale.salesperson] += sale.price;
    return acc;
  }, {});

  const result = Object.entries(salesBySalesperson).map(([salesperson, totalSales]) => ({
    salesperson,
    totalSales
  }));

  const { RangePicker } = DatePicker;

  return (
    <div>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Row justify="center" style={{ marginBottom: 24 }}>
          <Col span={24}>
            <RangePicker
              format="YYYY-MM-DD"
              onChange={handleChange}
            />
          </Col>
        </Row>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 120,
              }}
            >
              <TotalSales title="Sales" value={totalSales} />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 120,
              }}
            >
              <TotalSales title="Total Costs" value={costData} />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 120,
              }}
            >
              <TotalSales title="Revenue" value={revenue} />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 120,
              }}
            >
              <TotalSales title="Tax" value={totalTax} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={8} lg={9}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240, // Adjust height as necessary
              }}
            >
              <Charts />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <EmployeeSales data={result} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Reports;