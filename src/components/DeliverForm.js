import { Form,Input,DatePicker,Checkbox,Row,Col} from 'antd';

const DeliverForm = ({form}) =>{
    return(
    <Form
    form = {form}
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    initialValues={{ remember: true }}
    >
      <Form.Item label="Delivery Date" name="deliveryDate">
        <DatePicker />
      </Form.Item>

        <Form.Item
        label="Time Delivery"
        name="timeDelivery"
        >
        <Input />
        </Form.Item>

        <Form.Item
        label="Accessories"
        name="accessories"
        >
        <Input />
        </Form.Item>

    <Form.Item
        label="Note"
        name="note"
        >
        <Input />
        </Form.Item>

        <Form.Item name="installationHaulAway" label="Installation/Haul Away">
      <Checkbox.Group>
        <Row>
          <Col span={15}>
            <Checkbox value="installation" style={{ lineHeight: '32px' }}>
            Installation
            </Checkbox>
          </Col>
          <Col span={15}>
            <Checkbox value="takeaway" style={{ lineHeight: '32px' }}>
            Haul Away
            </Checkbox>
          </Col>
        </Row>
    </Checkbox.Group>
    </Form.Item>
    </Form>

    
    )
}

export default DeliverForm