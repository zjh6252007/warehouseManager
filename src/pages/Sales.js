import * as React from 'react';
import { Table, Space, Modal, Input, Button, Form, Checkbox, Select, DatePicker, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  getSalesByStoreId,
  deleteSales,
  getAllSales,
  returnSales,
  clearSalesList,
  addAccessory,
  setReceipt
} from '../redux/modules/sales';
import { getUserInfo } from '../redux/modules/user';
import { generateReceipt } from '../utils/generateReceipt';
import { fetchStoreDetail } from '../redux/modules/myStore';
import { useLocation, useParams } from 'react-router-dom';
import ReturnModalContent from '../components/ReturnModalContent';
import { generateDeliveryOrder } from '../utils/generateDeliveryOrder';
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
  }, [dispatch, userInfo.storeId, userInfo.role, storeId, isStorePage]);

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
  const [discount, setDiscount] = useState('');
  const [note, setNote] = useState('');
  const [receiptDate, setReceiptDate] = useState(null);
  const [payAmount, setPayAmount] = useState(''); // New state for Pay Amount

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

  useEffect(() => {
    const filtered = aggregatedData.filter(item =>
      item.invoiceNumber.includes(searchText) ||
      (item.contact && item.contact.includes(searchText)) ||
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
    
    // Initialize payAmount only if remainBalance > 0
    if (record.remainBalance > 0) {
      setPayAmount(''); // Empty string for user input
    } else {
      setPayAmount(0); // Default to 0 when not needed
    }
    
    setOpenReceiptModal(true);
  };

  const handleCloseReceiptModal = () => {
    setOpenReceiptModal(false);
    setPaymentType('');
    setIncludeInstallation(false);
    setInstallationFee('');
    setDiscount('');
    setNote('');
    setReceiptDate(null);
    setPayAmount(''); // Reset payAmount
  };

  const handleReceipt = (record, storeInfo) => {
    generateReceipt(record, storeInfo);
  };

  const handleGenerateReceipt = () => {
    // If remainBalance > 0, validate payAmount
    if (selectedRecord.remainBalance > 0) {
      const payAmt = parseFloat(payAmount);
      if (isNaN(payAmt) || payAmt <= 0) {
        message.error("Please enter a valid Pay Amount greater than 0.");
        return;
      }
      
      // Optional: Ensure payAmount does not exceed remainBalance
      if (payAmt > selectedRecord.remainBalance) {
        message.error("Pay Amount cannot exceed Amount Due.");
        return;
      }
    }
    
    const installationDiscountDTO = {
      installation: includeInstallation,
      paymentType: paymentType,
      installationFee: parseFloat(installationFee) || 0,
      discount: parseFloat(discount) || 0,
      note: note,
      storeId: selectedRecord.store.id,
      invoiceNumber: selectedRecord.invoiceNumber,
      createdAt: receiptDate,
      payAmount: selectedRecord.remainBalance > 0 ? parseFloat(payAmount) : 0, // Include payAmount
    };
    
    dispatch(setReceipt(installationDiscountDTO, selectedRecord.store.id));
    handleCloseReceiptModal();
  };

  const handleReturnItems = (selectedItems) => {
    if (storeId) {
      dispatch(returnSales(selectedItems, storeId, userInfo.id));
    } else {
      dispatch(returnSales(selectedItems, userInfo.storeId, userInfo.id));
    }
    handleCloseReturn();
  };

  const handleCancelOrder = (invoiceNumber, storeId) => {
    dispatch(deleteSales(invoiceNumber, storeId))
      .then(() => {
        if (userInfo.role === 'user') {
          dispatch(getSalesByStoreId(userInfo.storeId));
        } else if (userInfo.role === 'admin' && isStorePage) {
          dispatch(getSalesByStoreId(storeId));
        } else if (userInfo.role === 'admin') {
          dispatch(getAllSales());
        }
        handleClose();
      });
  };

  const handleAddAccessory = () => {
    const accessoryDTO = {
      storeId: selectedRecord.store.id,
      invoiceNumber: selectedRecord.invoiceNumber,
      price: parseFloat(accessoryPrice) || 0, // Ensure it's a number
      model: accessoryName
    };
    dispatch(addAccessory(accessoryDTO, selectedRecord.store.id));
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
      title: 'Amount Due',
      dataIndex: 'remainBalance',
      key: 'remainBalance',
      render: (value) => {
        const amount = value ?? 0; // Corrected line using Nullish Coalescing Operator
        return `$${parseFloat(amount).toFixed(2)}`;
      },
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
          <Button type="link" onClick={() => handleOpenReceiptModal(record)}>Set Up Receipt Info</Button>
          <Button type="link" onClick={() => handleReceipt(record, storeInfo)}>Receipt</Button>
          <Button type="link" onClick={() => generateDeliveryOrder(record, storeInfo)}>Delivery Form</Button>
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
        rowKey={(record) => `${record.invoiceNumber}-${record.id}`} // Ensure uniqueness
        columns={columns}
        dataSource={filteredData}
        onRow={(record) => ({
          style: {
            backgroundColor: record.remainBalance > 0 ? '#ffe6e6' : '', // Light red background
            color: record.remainBalance > 0 ? '#a8071a' : '', // Dark red text
          },
        })}
      />
      
      {/* Cancel Order Modal */}
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

      {/* Return Order Modal */}
      <Modal
        title="Return Order"
        open={openReturn}
        onCancel={handleCloseReturn}
        destroyOnClose
        footer={null}
      >
        <ReturnModalContent items={returnList} onReturn={handleReturnItems} />
      </Modal>

      {/* Add Accessory Modal */}
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
              placeholder="Enter accessory name"
            />
          </Form.Item>
          <Form.Item label="Price" required>
            <Input
              type="number"
              value={accessoryPrice}
              onChange={e => setAccessoryPrice(e.target.value)}
              placeholder="Enter accessory price"
              min={0}
              addonBefore="$"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Generate Receipt Modal */}
      <Modal
        title="Generate Receipt"
        open={openReceiptModal}
        onCancel={handleCloseReceiptModal}
        destroyOnClose
        onOk={handleGenerateReceipt}
      >
        <Form>
          <Form.Item label="Payment Type" required>
            <Select
              value={paymentType}
              onChange={value => setPaymentType(value)}
              placeholder="Select Payment Type"
            >
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="zelle">Zelle</Option>
              <Option value="check">Check</Option>
              <Option value="achima">Achima</Option>
              <Option value="snap">Snap</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Note">
            <Input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Enter note"
            />
          </Form.Item>
          
          <Form.Item label="Receipt Date">
            <DatePicker
              onChange={(date) => setReceiptDate(date)}
              format="YYYY-MM-DDTHH:mm:ss"
              showTime
              value={receiptDate}
              style={{ width: '100%' }}
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
                placeholder="Enter installation fee"
                min={0}
                addonBefore="$"
              />
            </Form.Item>
          )}
          
          <Form.Item label="Discount">
            <Input
              type="number"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              placeholder="Enter discount"
              min={0}
              addonBefore="$"
            />
          </Form.Item>
          
          {selectedRecord?.remainBalance > 0 && (
            <Form.Item label="Pay Amount"
            rules={[
              {
                type:'number',
                transform:(value)=>parseFloat(value),
              },
              {
                validator:(_,value)=>{
                  const amount = parseFloat(value);
                                      if (isNaN(amount) || amount <= 0) {
                      return Promise.reject(new Error('Pay Amount must be greater than 0.'));
                    }
                    if (amount > selectedRecord.remainBalance) {
                      return Promise.reject(new Error('Pay Amount cannot exceed Amount Due.'));
                    }
                    return Promise.resolve();
                }
              }
            ]}>
              <Input
                type="number"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                placeholder="Enter pay amount"
                min={0.01}
                addonBefore="$"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
