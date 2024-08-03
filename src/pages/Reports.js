import * as React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import { DatePicker, Row, Col } from 'antd';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { getSalesByDate, getAllSalesByRange } from '../redux/modules/sales';
import TotalSales from '../components/TotalSales';
import { getInventoryById } from '../redux/modules/inventory';
import { useEffect,useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getAllInventory } from '../redux/modules/inventory';
import EmployeeSales from '../components/EmployeeSales';
import Charts from '../components/Chart';
const Reports = () => {
  const dispatch = useDispatch();
  const { storeId } = useParams();
  const location = useLocation();
  const isStorePage = location.pathname.includes('/mystore');
  const [startDate,setStartDate] = useState();
  const [endDate,setEndDate] = useState();
  useEffect(() => {
    if (isStorePage) {
      dispatch(getInventoryById(storeId));
    } else {
      dispatch(getAllInventory());
    }
    const dateRange = {
      start: moment().format('YYYY-MM-DDTHH:mm:ss'),
      end: moment().format('YYYY-MM-DDTHH:mm:ss')
    };
    if (isStorePage) {
      dispatch(getSalesByDate(dateRange, storeId));
    } else {
      dispatch(getAllSalesByRange(dateRange));
    }
  }, [dispatch, storeId]);

  const inventory = useSelector(state => state.inventory.inventoryList);

  const handleChange = (dates, dateStrings) => {
    if (dates) {
      setStartDate(moment(dateStrings[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ss'));
      setEndDate(moment(dateStrings[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ss'));
      const dateRange = {
        start: moment(dateStrings[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
        end: moment(dateStrings[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ss')
      };
      if (isStorePage) {
        dispatch(getSalesByDate(dateRange, storeId));
      } else {
        dispatch(getAllSalesByRange(dateRange));
      }
    }
  };

  const salesData = useSelector(state => state.sales.salesData);
  const totalSales = salesData.reduce((acc, sale) => {
    const { invoiceNumber, price, warrantyPrice, deliveryFee, storeId, discount } = sale;
    acc.total += (price || 0) + (warrantyPrice || 0) - (discount || 0);
    const invoiceKey = `${invoiceNumber}-${storeId}`;
    if (!acc.invoices.has(invoiceKey)) {
      acc.total += deliveryFee || 0;
      acc.invoices.set(invoiceKey, true);
    }
    return acc;
  }, { total: 0, invoices: new Map() });
  const finalTotalSales = totalSales.total;

  console.log(salesData)
  const totalDeliveryFee = salesData.reduce((acc, sale) => {
    const { invoiceNumber, storeId, deliveryFee } = sale;
    const invoiceKey = `${invoiceNumber}-${storeId}`;
    if (!acc.invoices.has(invoiceKey)) {
      acc.total += deliveryFee || 0;
      acc.invoices.set(invoiceKey, true);
    }
    return acc;
  }, { total: 0, invoices: new Map() }).total;
  
  const costData = inventory.reduce((cost, inventory) => {
    return cost + (inventory.status === 'inStock' ? inventory.cost : 0);
  }, 0);

  const totalTax = salesData.reduce((total, sale) => {
    return total + (sale.taxes || 0);
  }, 0);

  const revenue = salesData.reduce((total, sale) => {
    const inventoryItem = inventory.find(item => item.sku === sale.serialNumber);
    let netSaleAmount = sale.price || 0;
    netSaleAmount += (sale.warrantyPrice || 0);
    netSaleAmount -= (sale.discount || 0);
    const cost = inventoryItem ? (inventoryItem.cost || 0) : 0;
    const profit = netSaleAmount - cost;
    return total + profit;
  }, 0);

  const cost = salesData.reduce((total,sale)=>{
    if (sale.type === 'Accessory') {
      return total;
    }
    const inventoryItem = inventory.find(item=> item.sku === sale.serialNumber);
    if(inventoryItem){
    const cost = inventoryItem.cost||0;
    return total + cost;
    }
    return total;
  },0)
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
          <Grid item xs={12} lg={4}>
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

          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 120,
              }}
            >
              <TotalSales title="Sales" value={finalTotalSales}/>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
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

          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 120,
              }}
            >
              <TotalSales title="Cost" value={cost} />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
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

          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 120,
              }}
            >
              <TotalSales title="Delivery Fee" value={totalDeliveryFee} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240, 
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