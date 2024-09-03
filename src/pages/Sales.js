import * as React from 'react';
import { Table, Space, Modal, Input, Button, Form, Checkbox, Select,DatePicker } from 'antd';
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
import { addAccessory,setReceipt} from '../redux/modules/sales';
import moment from 'moment';

const { Option } = Select;

export default function Sales() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isStorePage = location.pathname.includes('/mystore');

  useEffect(() => {
    dispatch(clearSalesList());
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
    const date = moment(dateString);
    if (!date.isValid()) {
        return 'Invalid Date';
    }
    return date.format('MM/DD/YYYY');
};

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [open, setOpen] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [returnList, setReturnList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [openAccessory, setOpenAccessory] = useState(false);
  const [accessoryName, setAccessoryName] = useState("");
  const [accessoryPrice, setAccessoryPrice] = useState("");


  const [openReceiptModal, setOpenReceiptModal] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [installationFee, setInstallationFee] = useState('');
  const [discount,setDiscount] = useState('');
  const [note,setNote] = useState('');
  const [receiptDate, setReceiptDate] = useState(null);

  const aggregatedData = React.useMemo(() => {
    const groupedData = {};
    if (salesInfo) {
      salesInfo.forEach((item) => {
        const key = `${item.store.id}-${item.invoiceNumber}`;
        if (!groupedData[key]) {
          groupedData[key] = { ...item, total: 0, subtotal:0,totalTax: 0, items: [], deliveryFee: item.deliveryFee || 0,taxRate:0,totalAfterDiscount:0 };
        }
        groupedData[key].subtotal += item.price;
        groupedData[key].total += item.price;
        groupedData[key].total += item.warrantyPrice;
        groupedData[key].total += item.taxes || 0;
        groupedData[key].total -= item.discount || 0;
        groupedData[key].total += item.installationFee || 0;
        groupedData[key].totalTax += item.taxes || 0;
        groupedData[key].items.push(item); 
      });
    }
    return Object.values(groupedData).map(data => ({
      ...data,
      total: data.total + data.deliveryFee,
      taxRate: ((data.totalTax/data.subtotal)*100).toFixed(2)
    }));
  }, [salesInfo]);

  useEffect(() => {
    const filtered = aggregatedData.filter(item =>
      item.invoiceNumber.includes(searchText) || (item.contact && item.contact.includes(searchText))||
      (item.customer && item.customer.toLowerCase().includes(searchText.toLowerCase()))
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

  const handleOpenAccessory = (record) => {
    setSelectedRecord(record);
    setOpenAccessory(true);
  };

  const handleCloseAccessory = () => {
    setOpenAccessory(false);
  };

  const handleOpenReceiptModal = (record) => {
    setSelectedRecord(record);
    setPaymentType(record.paymentType || '');
    setIncludeInstallation(!!record.includeInstallation);
    setInstallationFee(record.installationFee || '');
    setDiscount(record.discount || '');
    setNote(record.note || '');
    setReceiptDate(record.createdAt ? moment(record.createdAt) : null);
    setOpenReceiptModal(true);
  };

  const handleCloseReceiptModal = () => {
    setOpenReceiptModal(false);
    setPaymentType('');
    setIncludeInstallation(false);
    setInstallationFee('');
  };

  const handleReceipt = (record, storeInfo) => {
    generateReceipt(record, storeInfo);
  };

  const handleGenerateReceipt = () => {
    const installationDiscountDTO = {
      installation:includeInstallation,
      paymentType:paymentType,
      installationFee:installationFee,
      discount:discount,
      note:note,
      storeId:selectedRecord.store.id,
      invoiceNumber:selectedRecord.invoiceNumber,
      createdAt:receiptDate
    };
    dispatch(setReceipt(installationDiscountDTO,selectedRecord.store.id))
    handleCloseReceiptModal();
  };

  const handleReturnItems = (selectedItems) => {
    if (storeId) {
      dispatch(returnSales(selectedItems, storeId,userInfo.id));
    } else {
      dispatch(returnSales(selectedItems, userInfo.storeId,userInfo.id));
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

  const handleAddAccessory = () => {
    const accessoryDTO = {
      storeId:selectedRecord.store.id,
      invoiceNumber:selectedRecord.invoiceNumber,
      price:accessoryPrice,
      model:accessoryName
    };
    dispatch(addAccessory(accessoryDTO,selectedRecord.store.id));
    handleCloseAccessory();
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
      defaultSortOrder: 'descend', 
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
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
    ...(isStorePage || userInfo.role === 'user' ? [{
      title: 'Modify Order',
      dataIndex: '',
      key: 'x',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleOpenAccessory(record)}>Add Accessory</Button>
          <Button type="link" onClick={() => handleOpenReturn(record)}>Return</Button>
          {userInfo.role !== 'user' &&(
            <>
          <Button type="link" onClick={() => handleOpen(record)}>Cancel</Button>
            </>
          )}
          <Button type="link" onClick={() => handleOpenReceiptModal(record)}>Set Up Receipt Info</Button>
          <Button type="link" onClick={() => handleReceipt(record,storeInfo)}>Receipt</Button>
          <Button type="link" onClick={() => generateDeliveryOrder(record,storeInfo)}>Delivery Form</Button>
        </Space>
      )
    }] : [])
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
        rowKey={(record) => `${record.invoiceNumber}-${record.id}`}
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

      <Modal
        title="Add Accessory"
        open={openAccessory}
        onCancel={handleCloseAccessory}
        destroyOnClose
        onOk={handleAddAccessory}
      >
        <Form>
          <Form.Item label="Accessory Name" required>
            <Input
              value={accessoryName}
              onChange={e => setAccessoryName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Price" required>
            <Input
              type="number"
              value={accessoryPrice}
              onChange={e => setAccessoryPrice(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Generate Receipt"
        open={openReceiptModal}
        onCancel={handleCloseReceiptModal}
        destroyOnClose
        onOk={handleGenerateReceipt}
      >
        <Form>
          <Form.Item label="Payment Type" required>
            <Select value={paymentType} onChange={value => setPaymentType(value)}>
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="check">Check</Option>
              <Option value="achima">Achima</Option>
              <Option value="snap">Snap</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Note">
            <Input
              value={note}
              onChange={e=>setNote(e.target.value)}
            >
            </Input>
          </Form.Item>
          <Form.Item label="Receipt Date">
            <DatePicker
              onChange={(date) => setReceiptDate(date)}
              format="YYYY-MM-DDTHH:mm:ss"
              showTime
              value={receiptDate}
            />
          </Form.Item>
          <Form.Item>
            <Checkbox
              checked={includeInstallation}
              onChange={e => setIncludeInstallation(e.target.checked)}
            >
              Include Installation
            </Checkbox>
          </Form.Item>
          {includeInstallation && (
            <Form.Item label="Installation Fee" required>
              <Input
                type="number"
                value={installationFee}
                onChange={e => setInstallationFee(e.target.value)}
                addonBefore="$"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
