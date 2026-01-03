import * as React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import { DatePicker, Row, Col, Modal, Table, Tabs } from 'antd';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { getSalesByDate, getAllSalesByRange } from '../redux/modules/sales';
import TotalSales from '../components/TotalSales';
import { getInventoryById } from '../redux/modules/inventory';
import { useEffect,useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAllInventory } from '../redux/modules/inventory';
import EmployeeSales from '../components/EmployeeSales';
import Charts from '../components/Chart';
const Reports = () => {
  const dispatch = useDispatch();
  const { storeId } = useParams();
  const location = useLocation();
  const isStorePage = location.pathname.includes('/mystore');
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(moment().startOf('day'));
  const [endDate, setEndDate] = useState(moment().endOf('day'));
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  useEffect(() => {
    if (isStorePage) {
      dispatch(getInventoryById(storeId));
    } else {
      dispatch(getAllInventory());
    }
    const dateRange = {
      start: startDate.format('YYYY-MM-DDTHH:mm:ss'),
      end: endDate.format('YYYY-MM-DDTHH:mm:ss'),
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
      const [start, end] = dateStrings;
      const dateRange = {
        start: moment(start).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
        end: moment(end).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      };

      // 更新 state，方便做一些别的依赖
      setStartDate(moment(start));
      setEndDate(moment(end));

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
    acc[sale.salesperson] -= sale.discount;
    acc[sale.salesperson] += sale.warrantyPrice;
    return acc;
  }, {});

  const result = Object.entries(salesBySalesperson).map(([salesperson, totalSales]) => ({
    salesperson,
    totalSales
  }));

  // 计算库存变化
  const inventoryChanges = React.useMemo(() => {
    if (!inventory || inventory.length === 0) {
      return { added: [], sold: [], addedCount: 0, soldCount: 0 };
    }

    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    const added = inventory.filter(item => {
      if (!item.uploadDate) return false;
      const uploadDate = moment(item.uploadDate);
      return uploadDate.isBetween(start, end, null, '[]'); // 包含边界
    });

    const sold = inventory.filter(item => {
      if (!item.soldDate || item.status !== 'sold') return false;
      const soldDate = moment(item.soldDate);
      return soldDate.isBetween(start, end, null, '[]'); // 包含边界
    });

    return {
      added,
      sold,
      addedCount: added.length,
      soldCount: sold.length
    };
  }, [inventory, startDate, endDate]);

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
                cursor: isStorePage? 'pointer':'default',
              }}
              onClick={isStorePage? () => navigate(`${location.pathname}/detailreport`):undefined}
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

          {/* Inventory Changes Section */}
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3
                }
              }}
              onClick={() => setInventoryModalVisible(true)}
            >
              <div style={{ marginBottom: 16, fontSize: '18px', fontWeight: 'bold' }}>
                Inventory Changes
              </div>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      backgroundColor: '#e6f7ff',
                      border: '1px solid #91d5ff'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginBottom: 8 }}>
                      {inventoryChanges.addedCount}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Items Added
                    </div>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      backgroundColor: '#fff1f0',
                      border: '1px solid #ffccc7'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f', marginBottom: 8 }}>
                      {inventoryChanges.soldCount}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Items Sold
                    </div>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Inventory Details Modal */}
      <Modal
        title="Inventory Changes Details"
        open={inventoryModalVisible}
        onCancel={() => setInventoryModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Tabs
          defaultActiveKey="added"
          items={[
            {
              key: 'added',
              label: `Items Added (${inventoryChanges.addedCount})`,
              children: (
                <Table
                  dataSource={inventoryChanges.added}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: 'SKU',
                      dataIndex: 'sku',
                      key: 'sku',
                    },
                    {
                      title: 'Model',
                      dataIndex: 'model',
                      key: 'model',
                    },
                    {
                      title: 'Brand',
                      dataIndex: 'brand',
                      key: 'brand',
                    },
                    {
                      title: 'Item Description',
                      dataIndex: 'itemDescription',
                      key: 'itemDescription',
                      ellipsis: true,
                    },
                    {
                      title: 'Upload Date',
                      dataIndex: 'uploadDate',
                      key: 'uploadDate',
                      render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-',
                    },
                    {
                      title: 'Cost',
                      dataIndex: 'cost',
                      key: 'cost',
                      render: (cost) => cost ? `$${parseFloat(cost).toFixed(2)}` : '$0.00',
                    },
                  ]}
                />
              ),
            },
            {
              key: 'sold',
              label: `Items Sold (${inventoryChanges.soldCount})`,
              children: (
                <Table
                  dataSource={inventoryChanges.sold}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: 'SKU',
                      dataIndex: 'sku',
                      key: 'sku',
                    },
                    {
                      title: 'Model',
                      dataIndex: 'model',
                      key: 'model',
                    },
                    {
                      title: 'Brand',
                      dataIndex: 'brand',
                      key: 'brand',
                    },
                    {
                      title: 'Item Description',
                      dataIndex: 'itemDescription',
                      key: 'itemDescription',
                      ellipsis: true,
                    },
                    {
                      title: 'Sold Date',
                      dataIndex: 'soldDate',
                      key: 'soldDate',
                      render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-',
                    },
                    {
                      title: 'Sold Price',
                      dataIndex: 'soldPrice',
                      key: 'soldPrice',
                      render: (price) => price ? `$${parseFloat(price).toFixed(2)}` : '$0.00',
                    },
                    {
                      title: 'Cost',
                      dataIndex: 'cost',
                      key: 'cost',
                      render: (cost) => cost ? `$${parseFloat(cost).toFixed(2)}` : '$0.00',
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}

export default Reports;