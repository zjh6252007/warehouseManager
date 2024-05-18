import * as React from 'react';
import { Table, Space, Modal, Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getSalesByStoreId, deleteSales, getAllSales, returnSales } from '../redux/modules/sales';
import { getUserInfo } from '../redux/modules/user';
import { generateReceipt } from '../utils/generateReceipt';
import { fetchStoreDetail } from '../redux/modules/myStore';
import { useLocation, useParams } from 'react-router-dom';
import ReturnModalContent from '../components/ReturnModalContent';
import { clearSalesList } from '../redux/modules/sales';
import { generateDeliveryOrder } from '../utils/generateDeliveryOrder';
export default function Sales() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isStorePage = location.pathname.includes('/mystore');

  useEffect(() => {
    dispatch(clearSalesList())
    dispatch(getUserInfo());
  }, [dispatch]);

  const userInfo = useSelector(state => state.user.userInfo);
  const { storeId } = useParams();

  useEffect(() => {
    if (userInfo.role === 'user') {
      dispatch(getSalesByStoreId(userInfo.storeId));
      dispatch(fetchStoreDetail(userInfo.storeId));
    } else if (userInfo.role === 'admin' && isStorePage) {
      dispatch(getSalesByStoreId(storeId));
      dispatch(fetchStoreDetail(storeId));
    } else if (userInfo.role === 'admin') {
      dispatch(getAllSales());
    }
  }, [dispatch, userInfo.storeId, userInfo.role, storeId]);

  const salesInfo = useSelector(state => state.sales.salesList);
  const storeInfo = useSelector(state => state.myStore.currentStore);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toISOString().split('T')[0];
  };

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [open, setOpen] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [returnList, setReturnList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const aggregatedData = React.useMemo(() => {
    const groupedData = {};
    if (salesInfo) {
      salesInfo.forEach((item) => {
        const key = `${item.store.id}-${item.invoiceNumber}`;
        if (!groupedData[key]) {
          groupedData[key] = { ...item, total: 0, totalTax: 0, items: [], deliveryFee: item.deliveryFee || 0 };
        }
        groupedData[key].total += item.price;
        groupedData[key].total += item.warrantyPrice;
        groupedData[key].total += item.taxes || 0;
        groupedData[key].totalTax += item.taxes || 0;
        groupedData[key].items.push(item);
      });
    }
    return Object.values(groupedData).map(data => ({
      ...data,
      total: data.total + data.deliveryFee
    }));
  }, [salesInfo]);

  console.log(aggregatedData);
  useEffect(() => {
    const filtered = aggregatedData.filter(item =>
      item.invoiceNumber.includes(searchText) ||
      item.customer.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchText, aggregatedData]);

  const handleOpenReturn = (record) => {
    setReturnList(record.items || []);
    setSelectedRecord(record);
    setOpenReturn(true);
  };

  const handleCloseReturn = () => {
    setOpenReturn(false);
  };

  const handleOpen = (record) => {
    setSelectedRecord(record);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleReceipt = (record, storeInfo) => {
    generateReceipt(record, storeInfo);
  };

  const handleDeliverOrder = (record,storeInfo) =>{
    generateDeliveryOrder(record,storeInfo);
  }
  const handleReturnItems = (selectedItems) => {
    if (storeId) {
      dispatch(returnSales(selectedItems, storeId));
    } else {
      dispatch(returnSales(selectedItems, userInfo.storeId));
    }
    handleCloseReturn();
  };

  const handleCancelOrder = (invoiceNumber, storeId) => {
    dispatch(deleteSales(invoiceNumber, storeId))
      .then(() => {
        dispatch(getSalesByStoreId(storeId));
        handleClose();
      });
  };

  const columns = [
    ...(userInfo.role === 'admin' && !isStorePage ? [{
      title: 'Store Address',
      dataIndex: ['store', 'address'],
      key: 'storeAddress',
    }] : []),
    {
      title: 'Invoice#',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: formatDate,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer'
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact'
    },
    {
      title: 'Sales Person',
      dataIndex: 'salesperson',
      key: 'salesperson'
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (text) => `$${parseFloat(text).toFixed(2)}`
    },
    ...(isStorePage?[{
        title: 'Modify Order',
        dataIndex: '',
        key: 'x',
        render: (_, record) => (
          <Space size="middle">
            <Button type="link" onClick={() => handleOpenReturn(record)}>Return</Button>
            <Button type="link" onClick={() => handleOpen(record)}>Cancel</Button>
            <Button type="link" onClick={() => handleReceipt(record, storeInfo)}>Receipt</Button>
            <Button type="link" onClick={() => handleDeliverOrder(record, storeInfo)}>Delivery Info</Button>
          </Space>
        )
    }]:[])
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <Input
        placeholder="Search by Invoice or Customer"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Table
        rowKey="invoiceNumber"
        columns={columns}
        dataSource={filteredData}
      />
      <Modal
        title="Cancel Order"
        open={open}
        onCancel={handleClose}
        destroyOnClose
        onOk={() => handleCancelOrder(selectedRecord.invoiceNumber, userInfo.role === 'admin' ? storeId : userInfo.storeId)}
      >
        <div>
          Click Ok to cancel this order.
        </div>
      </Modal>

      <Modal
        title="Return Order"
        open={openReturn}
        onCancel={handleCloseReturn}
        destroyOnClose
        footer={null}
      >
        <ReturnModalContent items={returnList} onReturn={handleReturnItems} />
      </Modal>
    </div>
  );
}