import React, { useEffect, useState } from 'react';
import { Space, Table, Button, Modal, Form } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getDelivery } from '../redux/modules/delivery';
import DeliverForm from '../components/DeliverForm';
import { modifyDelivery } from '../redux/modules/delivery';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { useParams } from 'react-router-dom';

const Delivery = () => {
  const [form] = useForm();
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state.user.userInfo);
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState(null);
  const { storeId } = useParams();

  useEffect(() => {
    if (userInfo.role === 'user') {
      dispatch(getDelivery(userInfo.storeId));
    }else{
        dispatch(getDelivery(storeId));
    }
  }, [dispatch, userInfo,storeId]);

  const handleOpen = (record) => {
    setRecord(record);
    form.setFieldsValue({
      ...record,
      deliveryDate: record.deliveryDate ? moment(record.deliveryDate) : null,
      installationHaulAway: [
        record.installation ? 'installation' : null,
        record.takeaway ? 'takeaway' : null
      ].filter(Boolean)
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const installationHaulAway = values.installationHaulAway || [];
      const processedValues = {
        ...values,
        installation: installationHaulAway.includes('installation'),
        takeaway: installationHaulAway.includes('takeaway'),
        deliveryDate: values.deliveryDate ? values.deliveryDate.toISOString() : null,
        timeDelivery: values.timeDelivery || null,
        accessories: values.accessories || null,
        note: values.note || null,
      };
      if (userInfo.role === 'user'){
      dispatch(modifyDelivery(record.id,processedValues,userInfo.storeId));
      }else{
        dispatch(modifyDelivery(record.id,processedValues,storeId));
      }
      handleClose();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const deliveryList = useSelector(state => state.delivery.deliveryList).map(item => ({
    ...item,
    key: item.id,
  }));

  const columns = [
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      render: formatDate,
      defaultSortOrder:'descend',
      sorter:(a,b) => new Date(a.deliveryDate) - new Date(b.deliveryDate),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: 'Time Delivery',
      key: 'timeDelivery',
      dataIndex: 'timeDelivery',
    },
    {
      title: 'Accessories',
      key: 'accessories',
      dataIndex: 'accessories',
    },
    {
      title: 'TakeAway',
      key: 'takeaway',
      dataIndex: 'takeaway',
      render: (text) => (text ? 'Y' : 'N'),
    },
    {
      title: 'Installation',
      key: 'installation',
      dataIndex: 'installation',
      render: (text) => (text ? 'Y' : 'N'),
    },
    {
      title: 'Number',
      key: 'applianceNum',
      dataIndex: 'applianceNum',
    },
    {
      title: 'Detailes',
      key: 'salesTypes',
      dataIndex: 'salesTypes',
      render: (salesTypes) => (
        <div>
        {salesTypes
            .filter(type => type !== 'Accessory')
            .map((type, index) => (
              <div key={index}>{type}</div>
            ))}
        </div>
      )
    },
    {
      title: 'Note',
      key: 'note',
      dataIndex: 'note',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleOpen(record)}>Modify {record.name}</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <Table columns={columns} dataSource={deliveryList}></Table>
      <Modal
        title="Modify Delivery"
        open={open}
        onCancel={handleClose}
        onOk={handleSubmit}
        destroyOnClose
      >
        <DeliverForm form={form} />
      </Modal>
    </div>
  );
};

export default Delivery;
