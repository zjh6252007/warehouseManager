import * as React from 'react';
import { Table, Space, Modal, Input, Button, Form, Checkbox, Select, DatePicker, message, Spin, Card, Tag, Dropdown, Menu,Pagination } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  deleteSales,
  getSalesPagedAdmin,
  getSalesPagedByStore,
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
import { useMediaQuery } from '@mui/material';
import { MoreOutlined, FileTextOutlined, PlusCircleOutlined, RollbackOutlined, PrinterOutlined, TruckOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function Sales() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:768px)');
  const isStorePage = location.pathname.includes('/mystore');
  const [page,setPage] = useState(0);
  const [pageSize,setPageSize] = useState(isMobile ? 10 : 20);
  const [totalItems,setTotalItems] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [filteredData,setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(clearSalesList());
    dispatch(getUserInfo());
  }, [dispatch]);

  const userInfo = useSelector(state => state.user.userInfo);
  const { storeId } = useParams();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      if (userInfo.role === 'user') {
        const res = await dispatch(getSalesPagedByStore(userInfo.storeId, page, pageSize, searchText));
        setTotalItems(res?.totalElements || 0);
        dispatch(fetchStoreDetail(userInfo.storeId));
      } else if (userInfo.role === 'admin' && isStorePage) {
        const res = await dispatch(getSalesPagedByStore(storeId, page, pageSize, searchText));
        setTotalItems(res?.totalElements || 0);
        dispatch(fetchStoreDetail(storeId));
      } else if (userInfo.role === 'admin') {
        const res = await dispatch(getSalesPagedAdmin(page, pageSize, searchText));
        setTotalItems(res?.totalElements || 0);
      }
      setLoading(false);
    };
    fetchData();
  }, [dispatch, userInfo, storeId, isStorePage, page, pageSize, searchText]);

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
  const [payAmount, setPayAmount] = useState('');

const aggregatedData = React.useMemo(() => {
  if (!salesInfo) return [];
  // salesInfo: [{ invoiceNumber, sales: [...] }]
  return salesInfo.map(group => {
    // group.sales 是明细数组
    let subtotal = 0, total = 0, totalTax = 0, deliveryFee = 0;
    let customer = '', contact = '', createdAt = '', remainBalance = 0, id = undefined;
    let items = [];
    group.sales.forEach(item => {
      subtotal += parseFloat(item.price) || 0;
      total += parseFloat(item.price) || 0;
      total += parseFloat(item.warrantyPrice) || 0;
      total += parseFloat(item.taxes) || 0;
      total -= parseFloat(item.discount) || 0;
      total += parseFloat(item.installationFee) || 0;
      totalTax += parseFloat(item.taxes) || 0;
      deliveryFee = parseFloat(item.deliveryFee) || 0;
      if (!customer) customer = item.customer;
      if (!contact) contact = item.contact;
      if (!createdAt) createdAt = item.createdAt;
      if (!id) id = item.id;
      if (!remainBalance) remainBalance = parseFloat(item.remainBalance) || 0;
      items.push(item);
    });
    total = parseFloat((total + deliveryFee).toFixed(2));
    return {
      invoiceNumber: group.invoiceNumber,
      customer,
      contact,
      createdAt,
      subtotal,
      total,
      totalTax,
      taxRate: subtotal > 0 ? ((totalTax / subtotal) * 100).toFixed(2) : '0.00',
      deliveryFee,
      remainBalance,
      items,
      id,
    };
  });
}, [salesInfo]);

  console.log(aggregatedData)
  useEffect(() => {
    if (salesInfo && salesInfo.length > 0) {
      setFilteredData(aggregatedData);
    } else {
      setFilteredData([]);
    }
  }, [salesInfo, aggregatedData]);

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
    
    if (record.remainBalance > 0) {
      setPayAmount('');
    } else {
      setPayAmount(0);
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
    setPayAmount('');
  };

  const handleReceipt = (record, storeInfo) => {
    generateReceipt(record, storeInfo);
  };

  const handleGenerateReceipt = () => {
    if (selectedRecord.remainBalance > 0) {
      const payAmt = parseFloat(payAmount);
      if (isNaN(payAmt) || payAmt <= 0) {
        message.error("Please enter a valid Pay Amount greater than 0.");
        return;
      }
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
      payAmount: selectedRecord.remainBalance > 0 ? parseFloat(payAmount) : 0,
    };
    
    dispatch(setReceipt(
      installationDiscountDTO,
      selectedRecord.store.id,
      page,
      pageSize,
      searchText,
      userInfo
    ));
    handleCloseReceiptModal();
  };

  const handleReturnItems = (selectedItems) => {
    const sid = storeId || userInfo.storeId;
    dispatch(returnSales(selectedItems, sid, userInfo.id, page, pageSize, searchText, userInfo));
    handleCloseReturn();
  };

  const handleCancelOrder = (invoiceNumber, storeId) => {
    dispatch(deleteSales(invoiceNumber, storeId))
      .then(() => {
        if (userInfo.role === 'user') {
          dispatch(getSalesPagedByStore(userInfo.storeId, page, pageSize, searchText));
        } else if (userInfo.role === 'admin' && isStorePage) {
          dispatch(getSalesPagedByStore(storeId, page, pageSize, searchText));
        } else if (userInfo.role === 'admin') {
          dispatch(getSalesPagedAdmin(page, pageSize, searchText));
        }
        handleClose();
      });
  };

  const handleAddAccessory = () => {
    const accessoryDTO = {
      storeId: selectedRecord.store.id,
      invoiceNumber: selectedRecord.invoiceNumber,
      price: parseFloat(accessoryPrice) || 0,
      model: accessoryName
    };
    dispatch(addAccessory(accessoryDTO, selectedRecord.store.id, page, pageSize, searchText, userInfo));
    handleCloseAccessory();
  };

  // 移动端操作菜单
  const getActionMenu = (record) => (
    <Menu>
      <Menu.Item key="accessory" icon={<PlusCircleOutlined />} onClick={() => handleOpenAccessory(record)}>
        Add Accessory
      </Menu.Item>
      <Menu.Item key="return" icon={<RollbackOutlined />} onClick={() => handleOpenReturn(record)}>
        Return
      </Menu.Item>
      <Menu.Item key="receipt-setup" icon={<FileTextOutlined />} onClick={() => handleOpenReceiptModal(record)}>
        Set Up Receipt Info
      </Menu.Item>
      <Menu.Item key="receipt" icon={<PrinterOutlined />} onClick={() => handleReceipt(record, storeInfo)}>
        Receipt
      </Menu.Item>
      <Menu.Item key="delivery" icon={<TruckOutlined />} onClick={() => generateDeliveryOrder(record, storeInfo)}>
        Delivery Form
      </Menu.Item>
    </Menu>
  );

  // 移动端卡片视图
  const MobileCardView = () => (
    <div style={{ padding: '0 8px' }}>
      {filteredData.map((record) => (
        <Card
          key={`${record.invoiceNumber}-${record.id}`}
          style={{ 
            marginBottom: '12px',
            backgroundColor: record.remainBalance > 0 ? '#fff2f0' : '#fff',
            borderColor: record.remainBalance > 0 ? '#ffccc7' : '#f0f0f0'
          }}
          size="small"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ fontSize: '16px' }}>{record.customer}</strong>
                {record.remainBalance > 0 && (
                  <Tag color="red" style={{ marginLeft: '8px' }}>Due: ${record.remainBalance.toFixed(2)}</Tag>
                )}
              </div>
              
              <Space direction="vertical" size={4} style={{ fontSize: '14px', color: '#666' }}>
                <div>Invoice: #{record.invoiceNumber}</div>
                <div>Date: {formatDate(record.createdAt)}</div>
                <div>Contact: {record.contact}</div>
                <div style={{ fontWeight: 'bold', color: '#000' }}>
                  Total: ${record.total.toFixed(2)}
                </div>
              </Space>
            </div>
            
            {(isStorePage || userInfo.role === 'user') && (
              <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

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
        const amount = value ?? 0;
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
        onChange={(e)=>{
          setSearchText(e.target.value);
          setPage(0);
        }}
        style={{ marginBottom: 16 }}
        size={isMobile ? 'large' : 'middle'}
      />
      
      <div style={{ position: 'relative', height: 'calc(100vh - 140px)' }}>
        {loading ? (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
              zIndex: 10,
            }}
          >
            <Spin tip="Loading..." size="large" />
          </div>
        ) : (
          isMobile ? (
            <>
              <div style={{ height: 'calc(100% - 48px)', overflow: 'auto' }}>
                <MobileCardView />
              </div>
              <div style={{ 
                position: 'sticky', 
                bottom: 0, 
                background: '#fff', 
                padding: '8px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <Pagination
                  current={page + 1}
                  pageSize={pageSize}
                  total={totalItems}
                  showSizeChanger={false}
                  onChange={(newPage) => {
                    setPage(newPage - 1);
                  }}
                  simple
                  size="small"
                />
              </div>
            </>
          ) : (
            <Table
              rowKey={(record) => `${record.invoiceNumber}-${record.id}`}
              columns={columns}
              dataSource={filteredData}
              pagination={{
                current:page + 1,
                pageSize:pageSize,
                total:totalItems,
                showSizeChanger:true,
                onChange:(newPage,newPageSize)=>{
                  setPage(newPage-1);
                  setPageSize(newPageSize);
                }
              }}
              onRow={(record) => ({
                style: {
                  backgroundColor: record.remainBalance > 0 ? '#ffe6e6' : '',
                  color: record.remainBalance > 0 ? '#a8071a' : '',
                },
              })}
            />
          )
        )}
      </div>
      
      {/* Cancel Order Modal */}
      <Modal
        title="Cancel Order"
        open={open}
        onCancel={handleClose}
        destroyOnClose
        onOk={() => handleCancelOrder(selectedRecord.invoiceNumber, userInfo.role === 'admin' ? storeId : userInfo.storeId)}
        width={isMobile ? '100%' : undefined}
        style={isMobile ? { top: 20 } : {}}
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
        width={isMobile ? '100%' : undefined}
        style={isMobile ? { top: 20 } : {}}
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
        width={isMobile ? '100%' : undefined}
        style={isMobile ? { top: 20 } : {}}
      >
        <Form layout={isMobile ? 'vertical' : 'horizontal'}>
          <Form.Item label="Accessory Name" required>
            <Input
              value={accessoryName}
              onChange={e => setAccessoryName(e.target.value)}
              placeholder="Enter accessory name"
              size={isMobile ? 'large' : 'middle'}
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
              size={isMobile ? 'large' : 'middle'}
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
        width={isMobile ? '100%' : undefined}
        style={isMobile ? { top: 20 } : {}}
      >
        <Form layout={isMobile ? 'vertical' : 'horizontal'}>
          <Form.Item label="Payment Type" required>
            <Select
              value={paymentType}
              onChange={value => setPaymentType(value)}
              placeholder="Select Payment Type"
              size={isMobile ? 'large' : 'middle'}
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
              size={isMobile ? 'large' : 'middle'}
            />
          </Form.Item>
          
          <Form.Item label="Receipt Date">
            <DatePicker
              onChange={(date) => setReceiptDate(date)}
              format="YYYY-MM-DDTHH:mm:ss"
              showTime
              value={receiptDate}
              style={{ width: '100%' }}
              size={isMobile ? 'large' : 'middle'}
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
                size={isMobile ? 'large' : 'middle'}
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
              size={isMobile ? 'large' : 'middle'}
            />
          </Form.Item>
          
          {selectedRecord?.remainBalance > 0 && (
            <Form.Item 
              label="Pay Amount"
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
              ]}
            >
              <Input
                type="number"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                placeholder="Enter pay amount"
                min={0.01}
                addonBefore="$"
                size={isMobile ? 'large' : 'middle'}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}