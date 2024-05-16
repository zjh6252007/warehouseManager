import { Form,Input} from 'antd';

const CreateUserForm = ({form}) =>{
    return(
    <Form
    form = {form}
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    initialValues={{ remember: true }}
    >
    <Form.Item
    label="Username"
    name="username"
    rules={[{ required: true, message: 'Please enter username' }]}
    >
    <Input/>
    </Form.Item>

    <Form.Item
    label="Password"
    name="password"
    rules={[{ required: true, message: 'Please enter password' },
    ()=>({
        validator(_,value){
            if(!value || (/[A-Za-z]/.test(value) && /\d/.test(value)))
            {
                return Promise.resolve()
            }
            return Promise.reject(new Error('Password must contain at least one letter and one number!'))
        }
    })]}
    >
    <Input.Password />
    </Form.Item>
    
    <Form.Item
    label="Sales Name"
    name="salesName"
    
    >
    <Input />
    </Form.Item>
    </Form>

    
    )
}

export default CreateUserForm