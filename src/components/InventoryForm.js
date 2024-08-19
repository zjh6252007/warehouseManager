import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';

const { Option } = Select;

const InventoryForm = ({ visible, onCreate, onCancel, initialValues, storeInfo }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        location: initialValues?.store?.address
      });
    }
  }, [initialValues, form]);

  const handleStoreChange = (value) => {
    const selectedStore = storeInfo.find(store => store.address === value);
    if (selectedStore) {
      form.setFieldsValue({
        storeId: selectedStore.id,
        location: selectedStore.address
      });
    }
  };

  return (
    <Modal
      visible={visible}
      title={initialValues ? "Modify Inventory" : "Add Inventory"}
      okText={initialValues ? "Update" : "Create"}
      cancelText="Cancel"
      onCancel={() => {
        form.resetFields();
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
          initialValue={initialValues?.store?.address}
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
          name="location"
          label="Location"
          initialValue={initialValues?.store?.address}
        >
          <Input readOnly />
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
          rules={[{ required: true, message: 'Please input the Price!' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="extRetail"
          label="Ext Retail"
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="cost"
          label="Cost"
        >
          <InputNumber min={0} style={{ width: '100%' }} /> 
        </Form.Item>

        <Form.Item
          name="storeId"
          label="Store ID"
          hidden={true}
          initialValue={initialValues?.store?.id}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InventoryForm;
