import React, { useState } from 'react';
import { Table, Button, Checkbox, Input, Form, message } from 'antd';

const { TextArea } = Input;

const ReturnModalContent = ({ items, onReturn }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [form] = Form.useForm();

  const handleSelectItem = (item, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    }
  };

  const handleReturn = () => {
    if (selectedItems.length === 0) {
      message.warning('Please select at least one item to return');
      return;
    }
    
    if (!returnReason || returnReason.trim().length === 0) {
      message.error('Please enter a return reason');
      return;
    }
    
    onReturn(selectedItems, returnReason.trim());
  };

  const columns = [
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `$${parseFloat(text).toFixed(2)}`,
    },
    {
      title: 'Select',
      dataIndex: 'select',
      key: 'select',
      render: (_, record) => (
        <Checkbox onChange={(e) => handleSelectItem(record, e.target.checked)} />
      ),
    },
  ];

  return (
    <div>
      <Table rowKey="id" columns={columns} dataSource={items} pagination={false} />
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="Return Reason"
          required
          rules={[
            { required: true, message: 'Please enter a return reason' },
            { min: 3, message: 'Return reason must be at least 3 characters' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Please enter the reason for return..."
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
      <Button 
        type="primary" 
        onClick={handleReturn} 
        disabled={selectedItems.length === 0 || !returnReason || returnReason.trim().length === 0}
        style={{ marginTop: 8 }}
      >
        Return Selected Items
      </Button>
    </div>
  );
};

export default ReturnModalContent;