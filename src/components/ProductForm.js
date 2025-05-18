import { Button, message, Descriptions, Input,Space } from 'antd';
import {
  ProFormText,
  ProFormSelect,
  StepsForm,
  ProForm,
  ProFormDatePicker,
  ProFormCheckbox,
  ProFormDependency
} from '@ant-design/pro-components';
import { useDispatch, useSelector } from 'react-redux';
import React, { useRef, useState, useEffect } from 'react';
import { addToCart, clearCart } from '../redux/modules/cart';
import { getInventory, getInventoryById } from '../redux/modules/inventory';
import { postSales } from '../redux/modules/sales';
import moment from 'moment';
import { useLocation, useParams } from 'react-router-dom';
import { fetchStoreDetail } from '../redux/modules/myStore';

const ProductForm = ({ handleClose }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isStorePage = location.pathname.includes('/mystore');
  const { storeId } = useParams();
  const user_info = useSelector(state => state.user.userInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isStorePage) {
      dispatch(fetchStoreDetail(storeId));
    } else {
      dispatch(fetchStoreDetail(user_info.storeId));
    }
  }, [dispatch, isStorePage, storeId, user_info.storeId]);

  const store_info = useSelector(state => state.myStore.currentStore);

  useEffect(() => {
    if (store_info && store_info.id) {
      if (isStorePage) {
        dispatch(getInventoryById(store_info.id));
      } else {
        dispatch(getInventory());
      }
    }
  }, [dispatch, isStorePage, store_info]);

  const inventoryList = useSelector(state => state.inventory.inventoryList);
  const formRef = useRef();
  const [skuOptions, setSkuOptions] = useState([]);
  const modelOptions = inventoryList.reduce((acc, item) => {
    if (item.status !== 'sold' && !acc.some(option => option.value === item.model)) {
      acc.push({
        label: item.model,
        value: item.model,
        key: item.id
      });
    }
    return acc;
  }, []);
  const [currentStep, setCurrentStep] = useState(0);
  const [accessory, setAccessory] = useState({
    name: '',
    price: 0
  });
  const [customerData, setCustomerData] = useState({});
  const [selectedModel, setSelectedModel] = useState(null);
  const [taxRate, setTaxRate] = useState(null);

  const handleModelChange = value => {
    const relatedItems = inventoryList.filter(
      item => item.model === value && item.status !== 'sold'
    );
    if (relatedItems.length > 0) {
      const selectedItem = relatedItems[0];
      setSelectedModel(selectedItem);
      formRef.current?.setFieldsValue({
        price: selectedItem.unitRetail,
        type: selectedItem.product
      });
      const skus = relatedItems.map(item => ({ label: item.sku, value: item.sku }));
      setSkuOptions(skus);
    }
  };

  const handleAddAccessory = () => {
    if (!accessory || accessory.price <= 0) {
      message.error('Please fill in all required fields for the accessory');
      return;
    }
    const accessoryToCart = {
      model: accessory.name,
      price: accessory.price,
      type: 'Accessory',
      qty: 1
    };
    dispatch(addToCart(accessoryToCart));
    message.success('Accessory added to cart');
    setAccessory({ name: '', price: 0 });
  };

  const handleNext = () => {
    const isLastStep = currentStep === 3;
    if (cartList.length > 0 && currentStep === 0) {
      // Proceed without validating as cart is not empty
      setCurrentStep(currentStep + 1);
    } else if (cartList.length === 0 && currentStep === 0) {
      message.error('Please Add to Cart First');
    } else if (!isLastStep) {
      formRef.current
        ?.validateFields()
        .then(values => {
          if (values.deliveryDate) {
            values.deliveryDate = values.deliveryDate.format('YYYY-MM-DD');
          }
          if (currentStep === 0) {
            dispatch(addToCart(values));
          }
          if (currentStep === 2) {
            setCustomerData(values);
          }
          setCurrentStep(currentStep + 1);
        })
        .catch(info => {
          message.error('Please fill in all required fields');
        });
    } else {
      formRef.current?.submit();
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const cartHandle = () => {
    formRef.current
      ?.validateFields()
      .then(values => {
        dispatch(addToCart(values));
        message.success('Added to cart');
        formRef.current?.resetFields();
      })
      .catch(info => {
        message.error('Please fill in all required fields');
      });
  };

  const resetForm = () => {
    formRef.current?.resetFields();
  };

  const cartList = useSelector(state => state.cart.cartList);

  const calculateTotalPrice = (customer, cart) => {
    let totalPrice = cart.reduce((total, item) => {
      let itemTotal = parseFloat(item.price) || 0;
      if (item.extendedwarranty > 0 && item.warrantyPrice && !isNaN(parseFloat(item.warrantyPrice))) {
        itemTotal += parseFloat(item.warrantyPrice) * parseFloat(item.extendedwarranty);
      }
      if (!isNaN(parseFloat(item.deliveryFee))) {
        itemTotal += parseFloat(item.deliveryFee);
      }
      return total + itemTotal;
    }, 0);

    if (customer.deliveryFee && !isNaN(parseFloat(customer.deliveryFee))) {
      totalPrice += parseFloat(customer.deliveryFee);
    }

    if (customer.discount) {
      totalPrice -= parseFloat(customer.discount);
    }

    const _taxRate = taxRate || store_info.taxRate;
    let calculatedTax = 0;
    if (_taxRate) {
      calculatedTax = totalPrice * _taxRate * 0.01;
      totalPrice += calculatedTax;
    }

    return { totalPrice, calculatedTax };
  };

  const renderProductDescriptions = item => {
    return (
      <Descriptions bordered>
        <Descriptions.Item label="Model">{item.model}</Descriptions.Item>
        <Descriptions.Item label="Product Type">{item.type}</Descriptions.Item>
        <Descriptions.Item label="Price">${item.price}</Descriptions.Item>
        <Descriptions.Item label="Free Warranty">
          {item.freewarranty ? `${item.freewarranty} Years` : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Extended Warranty">
          {item.extendedwarranty ? `${item.extendedwarranty} Years` : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Warranty Price">
          {item.warrantyPrice ? `$${item.warrantyPrice * item.extendedwarranty}` : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Serial Number" span={1}>
          {item.serialNumber}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const renderOtherDescriptions = (customer, cart) => {
    const { totalPrice, calculatedTax } = calculateTotalPrice(customer, cart);

    return (
      <Descriptions bordered style={{ marginBottom: 15 }}>
        <Descriptions.Item label="Customer Name">{customer.customer}</Descriptions.Item>
        <Descriptions.Item label="Address">{customer.address}</Descriptions.Item>
        <Descriptions.Item label="Phone">{customer.contact || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Sales">{customer.sales || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Delivery Date">{customer.deliveryDate || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Delivery Fee">${customer.deliveryFee || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Discount">${customer.discount || '0'}</Descriptions.Item>
        {calculatedTax > 0 && (
          <Descriptions.Item label="Tax">${calculatedTax.toFixed(2)}</Descriptions.Item>
        )}
        {customer.invoiceNumber && (
          <Descriptions.Item label="Invoice Number">{customer.invoiceNumber}</Descriptions.Item>
        )}
        <Descriptions.Item label="Total Price" style={{ color: 'red' }}>
          ${totalPrice.toFixed(2)}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const validateUnitPrice = (_, value) => {
    if (selectedModel) {
      const minPrice = selectedModel.unitRetail * selectedModel.limitPercentage * 0.01;
      if (value < minPrice) {
        return Promise.reject(new Error(`Unit price cannot be lower than ${minPrice}`));
      }
    }
    return Promise.resolve();
  };

  const PhoneInput = ({ onChange }) => {
    const [parts, setParts] = useState({ a: '', b: '', c: '' });
    const refA = useRef();
    const refB = useRef();
    const refC = useRef();
  
    const handleChange = (key, maxLen, nextRef) => (e) => {
      const val = e.target.value.replace(/\D/g, '').slice(0, maxLen);
      const updated = { ...parts, [key]: val };
      setParts(updated);
  
  
      const full = `${updated.a}-${updated.b}-${updated.c}`;
      if (onChange) onChange(full);
      if (val.length === maxLen && nextRef?.current) {
        nextRef.current.focus();
      }
    };
  
    
    return (
      <Space>
        <Input
          ref={refA}
          value={parts.a}
          onChange={handleChange('a', 3, refB)}
          maxLength={3}
          style={{ width: 60, textAlign: 'center' }}
        />
        <span>-</span>
        <Input
          ref={refB}
          value={parts.b}
          onChange={handleChange('b', 3, refC)}
          maxLength={3}
          style={{ width: 60, textAlign: 'center' }}
        />
        <span>-</span>
        <Input
          ref={refC}
          value={parts.c}
          onChange={handleChange('c', 4)}
          maxLength={4}
          style={{ width: 80, textAlign: 'center' }}
        />
      </Space>
    );
  };

  return (
    <>
      <StepsForm
        current={currentStep}
        formRef={formRef}
        onFinish={async () => {
          if (isSubmitting) return;
          setIsSubmitting(true);
          const { totalPrice, calculatedTax } = calculateTotalPrice(customerData, cartList);
          const totalAmount = totalPrice;
          const paidAmount = customerData.paidAmount ? Number(customerData.paidAmount) : 0;
          const remainBalance = paidAmount > 0 ? totalAmount - paidAmount : 0;
          const finalData = {
            cart: cartList.map(item => ({
              storeId: store_info.id,
              model: item.model,
              price: item.price,
              type: item.type,
              customer: customerData.customer,
              contact: customerData.contact,
              address: customerData.address,
              serialNumber: item.serialNumber,
              salesperson: customerData.sales,
              sku: item.customSerialNumber && item.customSerialNumber.trim() !== ''
                ? item.customSerialNumber
                : item.serialNumber,
              warranty: (Number(item.freewarranty) || 0) + (Number(item.extendedwarranty) || 0),
              warrantyPrice: (item.warrantyPrice || 0) * (Number(item.extendedwarranty) || 0),
              taxes: calculatedTax,
              deliveryFee: customerData.deliveryFee,
              deliveryDate: customerData.deliveryDate
                ? moment(customerData.deliveryDate).format('YYYY-MM-DDTHH:mm:ss')
                : null,
              discount: customerData.discount,
              note: customerData.note,
              paymentType: customerData.paymentType,
              remainBalance: remainBalance,
              ...(store_info.modifyInvoiceNumber && {
                invoiceNumber: customerData.invoiceNumber
              })
            }))
          };
          try {
            const res = await dispatch(postSales(finalData));
            if (res.code === 0) {
              formRef.current?.resetFields();
              dispatch(clearCart());
              handleClose();
              message.success('Submitted Successfully');
            } else {
              message.error(res.message);
            }
          } catch (error) {
            console.error(error);
            message.error('Submission failed');
          } finally {
            setIsSubmitting(false);
          }
        }}
        formProps={{
          validateMessages: {
            required: ''
          }
        }}
        submitter={{
          render: (props, defaultDoms) => {
            const isLastStep = props.step === 3;
            const isFirstStep = props.step === 0;

            return [
              props.step > 0 && (
                <Button key="prev" onClick={handlePrev} style={{ marginRight: 8 }}>
                  Prev
                </Button>
              ),
              <Button
                key="next"
                type="primary"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isLastStep ? 'Submit' : 'Next'}
              </Button>,
              isFirstStep ? (
                <Button key="addcart" style={{ marginLeft: 10 }} onClick={cartHandle}>
                  Add to Cart
                </Button>
              ) : null,

              !isLastStep && (
                <Button key="reset" style={{ marginLeft: 170 }} onClick={resetForm}>
                  Reset
                </Button>
              )
            ];
          }
        }}
      >
        <StepsForm.StepForm name="product" title="Product Info">
          <ProFormSelect
            showSearch
            name="model"
            label="Model"
            placeholder="Select Model"
            rules={[{ required: true }]}
            options={modelOptions}
            optionFilterProp="children"
            filterOption={(input, option) => (option?.label ?? '').includes(input)}
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
            }
            fieldProps={{
              onChange: handleModelChange
            }}
          />
          <ProFormText
            name="price"
            label="Unit Price"
            rules={[
              { required: true },
              { validator: validateUnitPrice }
            ]}
            placeholder="price"
            fieldProps={{
              addonBefore: '$',
              type: 'number'
            }}
          />

          <ProFormSelect
            name="serialNumber"
            label="SKU"
            placeholder="sku"
            options={skuOptions}
            rules={[{ required: true }]}
          />

          <ProFormText
            name="customSerialNumber"
            label="Serial Number"
            placeholder="Serial"
          />
          <ProFormText
            name="type"
            label="Type"
            disabled={true}
            placeholder=" "
          />

          <ProFormText
            name="freewarranty"
            label="Free Warranty"
            width="30%"
            placeholder="warranty"
            initialValue={1}
            fieldProps={{
              addonAfter: 'year',
              type: 'number'
            }}
          />
          <ProForm.Group>
            <ProFormText
              name="extendedwarranty"
              label="Extended Warranty"
              width="50%"
              placeholder="warranty"
              initialValue={0}
              fieldProps={{
                addonAfter: 'year',
                type: 'number'
              }}
            />

            <ProFormText
              name="warrantyPrice"
              label="Warranty Price(/Year)"
              width="50%"
              placeholder="price"
              initialValue={0}
              fieldProps={{
                addonBefore: '$',
                type: 'number'
              }}
            />
          </ProForm.Group>
        </StepsForm.StepForm>

        <StepsForm.StepForm name="accessory" title="Accessory">
          <ProFormText
            name="name"
            label="Accessory"
            fieldProps={{
              placeholder: 'Enter accessory name',
              value: accessory.name,
              onChange: e => setAccessory({ ...accessory, name: e.target.value })
            }}
          />
          <ProFormText
            name="accessoryprice"
            label="Price"
            fieldProps={{
              placeholder: 'Enter price',
              type: 'number',
              value: accessory.price,
              onChange: e => setAccessory({ ...accessory, price: parseFloat(e.target.value) }),
              prefix: '$'
            }}
          />
          <Button
            style={{ width: '30%', marginBottom: 30 }}
            onClick={handleAddAccessory}
          >
            Add to Cart
          </Button>
        </StepsForm.StepForm>

        <StepsForm.StepForm name="customer" title="Other Info">
          <ProFormText
            name="customer"
            label="Customer Name"
            placeholder="Name"
            rules={[{ required: true }]}
          />
          <ProFormText
            name="address"
            label="Address"
            placeholder="address"
            rules={[{ required: true }]}
          />
<ProForm.Item
  name="contact"
  label="Phone"
  rules={[{ required: true, message: 'Please enter a valid phone number' }]}
>
  <PhoneInput />
</ProForm.Item>
          <ProFormText
            name="sales"
            label="Sales"
            placeholder="Sales Name"
            initialValue={user_info.salesName}
          />

          <ProForm.Group>
            <ProFormDatePicker
              name="deliveryDate"
              label="Delivery Date"
              width="70%"
              placeholder="deliveryDate"
              fieldProps={{
                format: 'YYYY-MM-DD'
              }}
            />

            <ProFormText
              name="deliveryFee"
              label="Delivery Fee"
              width='50%'
              placeholder="price"
              initialValue={0}
              fieldProps={{
                addonBefore: '$',
                type: 'number'
              }}
            />
          </ProForm.Group>

          <ProFormSelect
            name="paymentType"
            label="Payment Type"
            placeholder="Select a payment type"
            rules={[{ required: true }]}
            options={[
              { value: ' ', label: ' ' },
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card' },
              { value: 'check', label: 'Check' },
              { value: 'achima', label: 'Achima' },
              { value: 'snap', label: 'Snap' },
              { value: 'zelle', label: 'Zelle' }
            ]}
          />

          <ProFormCheckbox
            name="paidInFull"
            label="Paid in Full"
            initialValue={true}
          />

          <ProFormDependency name={['paidInFull']}>
            {({ paidInFull }) =>
              !paidInFull ? (
                <ProFormText
                  name="paidAmount"
                  label="Paid Amount"
                  placeholder="Enter paid amount"
                  rules={[
                    { required: true, message: 'Please enter the paid amount' },
                    {
                      validator: (_, value) => {
                        if (value && Number(value) > 0) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Amount must be greater than 0'));
                      }
                    }
                  ]}
                  fieldProps={{
                    addonBefore: '$',
                    type: 'number',
                    min: 0.01,
                    step: 0.01
                  }}
                  width="sm"
                />
              ) : null
            }
          </ProFormDependency>

          <ProForm.Group>
            <ProFormText
              name="tax_rate"
              label="Tax Rate"
              width="50%"
              placeholder="tax"
              value={taxRate}
              initialValue={0}
              fieldProps={{
                addonBefore: '%',
                type: 'number',
                onChange: e => setTaxRate(e.target.value)
              }}
            />

            <ProFormText
              name="discount"
              label="Discount"
              width="50%"
              placeholder="Discount"
              initialValue={0}
              fieldProps={{
                addonBefore: '$',
                type: 'number'
              }}
            />
          </ProForm.Group>

          {/* Conditionally Render Invoice Number Field */}
          {store_info.modifyInvoiceNumber && (
            <ProFormText
              name="invoiceNumber"
              label="Invoice Number"
              placeholder="Enter invoice number"
              rules={[{ required: true, message: 'Please enter the invoice number' }]}
            />
          )}

          <ProFormText
            name="note"
            label="Note"
            placeholder="Add note"
          />
        </StepsForm.StepForm>

        <StepsForm.StepForm name="confirm" title="Confirm">
          {cartList.map((item, id) => (
            <div key={id} style={{ marginBottom: 12 }}>
              {item.type === 'Accessory' ? '' : renderProductDescriptions(item)}
            </div>
          ))}
          {renderOtherDescriptions(customerData, cartList)}
        </StepsForm.StepForm>
      </StepsForm>
    </>
  );
};

export default ProductForm;
