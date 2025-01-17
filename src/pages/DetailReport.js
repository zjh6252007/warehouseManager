import React, { useMemo, useState } from 'react';
import {
  Container,
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TableFooter,
  TablePagination
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TotalSales from '../components/TotalSales';
const DetailReport = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const handleBack = () => {
    navigate(`/store/mystore/sales/reports/${storeId}`);
  };


  const salesInfo = useSelector(state => state.sales.salesData);

    const aggregatedData = React.useMemo(() => {
      const groupedData = {};
      if (salesInfo) {
        salesInfo.forEach((item) => {
          const key = `${item.store.id}-${item.invoiceNumber}`;
          if (!groupedData[key]) {
            groupedData[key] = {
              ...item,
              total: 0,
              subtotal: 0,
              totalTax: 0,
              items: [],
              deliveryFee: parseFloat(item.deliveryFee) || 0,
              taxRate: 0,
              totalAfterDiscount: 0
            };
          }
          groupedData[key].subtotal += parseFloat(item.price) || 0;
          groupedData[key].total += parseFloat(item.price) || 0;
          groupedData[key].total += parseFloat(item.warrantyPrice) || 0;
          groupedData[key].total += parseFloat(item.taxes) || 0;
          groupedData[key].total -= parseFloat(item.discount) || 0;
          groupedData[key].total += parseFloat(item.installationFee) || 0;
          groupedData[key].totalTax += parseFloat(item.taxes) || 0;
          groupedData[key].items.push(item);
        });
      }
      return Object.values(groupedData).map(data => ({
        ...data,
        total: parseFloat((data.total + parseFloat(data.deliveryFee)).toFixed(2)),
        taxRate: data.subtotal > 0 ? ((data.totalTax / data.subtotal) * 100).toFixed(2) : '0.00'
      }));
    }, [salesInfo]);

  const paymentTotals = aggregatedData.reduce((acc, sale) => {
    const { paymentType, total } = sale;
    if (!acc[paymentType]) {
      acc[paymentType] = 0;
    }
    acc[paymentType] += total || 0;
    return acc;
  }, {});
  

  const [page, setPage] = useState(0); // 当前页（从0开始）
  const [rowsPerPage, setRowsPerPage] = useState(20); // 每页展示多少条

  // 当切换页码时
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // 当切换每页条数时
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 根据当前页码 + 每页条数，计算出要渲染的数据切片
  const currentPageData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return aggregatedData.slice(start, end);
  }, [aggregatedData, page, rowsPerPage]);



  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>

      <Box mb={2}>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
        >
          Back
        </Button>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
              <TotalSales title="Card" value={paymentTotals.card || 0}/>
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
              <TotalSales title="Cash" value={paymentTotals.cash ||0}/>
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
              <TotalSales title="Snap" value={paymentTotals.snap || 0}/>
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
              <TotalSales title="Check" value={paymentTotals.check||0} />
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
              <TotalSales title="Achima" value={paymentTotals.achima||0}/>
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
              <TotalSales title="Zelle"  value={paymentTotals.zelle||0}/>
            </Paper>
          </Grid>
        </Grid>
      </Container>


      <Typography variant="h6" gutterBottom>
        Detail Report
      </Typography>


      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Type</TableCell>
                <TableCell>Note</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currentPageData.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {new Date(row.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>{`$${row.total ?? 0}`}</TableCell>
                  <TableCell>{row.paymentType}</TableCell>
                  <TableCell>{row.note}</TableCell>
                </TableRow>
              ))}

              {currentPageData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>No data</TableCell>
                </TableRow>
              )}
            </TableBody>

            {/* 表格底部：分页 */}
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[20, 50, 100]} // 你想要哪些选项
                  count={aggregatedData.length}       // 总行数
                  rowsPerPage={rowsPerPage}           
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Rows per page"
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};
export default DetailReport;
