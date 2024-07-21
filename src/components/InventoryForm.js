import React from 'react';
import { Modal, Form, Input} from 'antd';

const InventoryForm = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      visible={visible}
      title="Add Inventory"
      okText="Create"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            form.resetFields();
            onCreate(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
      >
        <Form.Item
          name="sku"
          label="SKU"
          rules={[{ required: true, message: 'Please input the SKU!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="product"
          label="Product"
          rules={[{ required: true, message: 'Please input the Item type!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="model"
          label="Model"
          rules={[{ required: true, message: 'Please input the model number!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="itemDescription"
          label="Item Description"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="location"
          label="Location"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="brand"
          label="Brand"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="category"
          label="Category"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="subcategory"
          label="Subcategory"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="unitRetail"
          label="Unit Retail"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="extRetail"
          label="Ext Retail"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="cost"
          label="Cost"
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InventoryForm;
