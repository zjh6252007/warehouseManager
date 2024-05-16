import * as React from 'react';
import { Table, Space, Modal, Input,Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getSalesByStoreId, deleteSales } from '../redux/modules/sales';
import { getUserInfo } from '../redux/modules/user';
import { generateReceipt } from '../utils/generateReceipt';
import { fetchStoreDetail } from '../redux/modules/myStore';
import { useParams } from 'react-router-dom';
import ReturnModalContent from '../components/ReturnModalContent';
import { returnSales } from '../redux/modules/sales';
export default function Sales() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);

  const userInfo = useSelector(state => state.user.userInfo);
  const { storeId } = useParams();

  useEffect(() => {
    if (userInfo.role === 'user') {
      dispatch(getSalesByStoreId(userInfo.storeId));
      dispatch(fetchStoreDetail(userInfo.storeId));
    } else {
      dispatch(getSalesByStoreId(storeId));
    }
  }, [dispatch, userInfo.storeId, userInfo.role, storeId]);

  const salesInfo = useSelector(state => state.sales.salesList);
  const store_info = useSelector(state => state.myStore.currentStore);

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

  const aggreatedData = React.useMemo(() => {
    const groupedData = {};
    salesInfo.forEach((item) => {
      if (!groupedData[item.invoiceNumber]) {
        groupedData[item.invoiceNumber] = { ...item, total: 0, totalTax:0,items: [] };
      }
      groupedData[item.invoiceNumber].total += item.price;
      groupedData[item.invoiceNumber].total += item.warrantyPrice;
      groupedData[item.invoiceNumber].total += item.taxes || 0;
      groupedData[item.invoiceNumber].totalTax += item.taxes || 0;
      groupedData[item.invoiceNumber].items.push(item);
    });
    return Object.values(groupedData);
  }, [salesInfo]);

  console.log( aggreatedData)
  useEffect(() => {
    const filtered = aggreatedData.filter(item =>
      item.invoiceNumber.includes(searchText) ||
      item.customer.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchText, aggreatedData]);

  const handelOpenReturn = (record) => {
    setReturnList(record.items || []); // Ensure returnList is always an array
    setSelectedRecord(record);
    setOpenReturn(true);
  };

  const handelCloseReturn = () => {
    setOpenReturn(false);
  };

  const handelOpen = (record) => {
    setSelectedRecord(record);
    setOpen(true);
  };

  const handelClose = () => {
    setOpen(false);
  };

  const handelReceipt = (record, store_info) => {
    generateReceipt(record, store_info);
  };

  const handleReturnItems = (selectedItems) => {
    console.log('Selected items for return:', selectedItems);
    if(storeId){
    dispatch(returnSales(selectedItems,storeId))
    }else{
      dispatch(returnSales(selectedItems,userInfo.storeId));
    }
    handelCloseReturn();
  };

  const handelCancelOrder = (invoiceNumber, storeId) => {
    dispatch(deleteSales(invoiceNumber, storeId))
      .then(() => {
        dispatch(getSalesByStoreId(storeId));
        handelClose();
      });
  };

  const columns = [
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
    {
      title: 'Modify Order',
      dataIndex: '',
      key: 'x',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handelOpenReturn(record)}>Return</Button>
          <Button type="link" onClick={() => handelOpen(record)}>Cancel</Button>
          <Button type="link" onClick={() => handelReceipt(record, store_info)}>Receipt</Button>
        </Space>
      )
    }
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
        onCancel={handelClose}
        destroyOnClose
        onOk={() => handelCancelOrder(selectedRecord.invoiceNumber, userInfo.role === 'admin' ? storeId : userInfo.storeId)}
      >
        <div>
          Click Ok to cancel this order.
        </div>
      </Modal>

      <Modal
        title="Return Order"
        open={openReturn}
        onCancel={handelCloseReturn}
        destroyOnClose
        footer={null}
      >
        <ReturnModalContent items={returnList} onReturn={handleReturnItems} />
      </Modal>
    </div>
  );
}