import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';

const { Option } = Select;

const InventoryForm = ({ visible, onCreate, onCancel, initialValues, storeInfo }) => {
  const [form] = Form.useForm();

  // 设置表单的初始值，包括默认的storeId
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // 当选择框发生变化时，自动更新隐藏的 storeId 字段
  const handleStoreChange = (value) => {
    const selectedStore = storeInfo.find(store => store.address === value);
    if (selectedStore) {
      form.setFieldsValue({ storeId: selectedStore.id });
    }
  };

  return (
    <Modal
      visible={visible}
      title={initialValues ? "Modify Inventory" : "Add Inventory"}
      okText={initialValues ? "Update" : "Create"}
      cancelText="Cancel"
      onCancel={() => {
        form.resetFields(); // Reset form on cancel
        onCancel();
      }}
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
          name="storeAddress"
          label="Change Store"
          initialValue={initialValues?.store?.address}  // 设置默认值
        >
          <Select onChange={handleStoreChange}>
            {storeInfo.map(store => (
              <Option key={store.id} value={store.address}>
                {store.address}
              </Option>
            ))}
          </Select>
        </Form.Item>


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

        {/* 隐藏的 storeId 项 */}
        <Form.Item
          name="storeId"
          label="Store ID"
          hidden={true}
          initialValue={initialValues?.store?.id}  // 设置默认值
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InventoryForm;
