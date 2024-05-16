import React, { useState } from 'react';
import { Table, Button, Checkbox } from 'antd';

const ReturnModalContent = ({ items, onReturn }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectItem = (item, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    }
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
      <Button type="primary" onClick={() => onReturn(selectedItems)} disabled={selectedItems.length === 0}>
        Return Selected Items
      </Button>
    </div>
  );
};

export default ReturnModalContent;