import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchStoreDetail } from "../redux/modules/myStore";
import { useParams } from "react-router-dom";
import { useEffect,useState } from "react";
import { Button,Grid,Dialog,DialogTitle,DialogContent,DialogActions} from "@mui/material";
import CreateUserForm from "../components/CreateUserForm";
import { useForm } from "antd/es/form/Form";
import { register } from "../redux/modules/user";
import { Space, Table, message,Popconfirm} from 'antd';
import { getUserList } from "../redux/modules/user";
import { switchAccountState } from "../redux/modules/user";
const StoreDetail = () =>{
    const {storeId} = useParams();
    const navigate= useNavigate();
    const dispatch = useDispatch();
    const [form] = useForm();
    const [open,setOpen] = useState(false);
    const [selectionModel, setSelectionModel] = useState([]);
    const confirm = (id) =>{
        if(id){
        console.log(id);
        dispatch(switchAccountState(id,storeId));
        }
    }

    const columns = [
        {
          title: 'Username',
          dataIndex: 'username',
          key: 'username',
          render: (text) => <a>{text}</a>,
        },
        {
            title:'State',
            dataIndex:'active',
            key:'active',
            render: (active) => active ? 'Active' : 'Inactive', 
        },
        {
            title:'Sales Name',
            dataIndex:'salesName',
            key:'salesName'
        },
        {
          title: 'Action',
          key: 'action',
          render: (_, record) => (
            <Space size="middle">
              {record.active?(
            <Popconfirm
                title="Deactive Account"
                description="Are you sure to deactive this account?"
                onConfirm={()=>confirm(record.id)}
                okText="Yes"
                cancelText="Cancel">
              <a>Deactive</a>
              </Popconfirm>
              ):(
            <a onClick={()=>confirm(record.id)}>Active</a>
              )
              }
            </Space>
          ),
        },
      ];

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
            dispatch(fetchStoreDetail(storeId)),
            dispatch(getUserList(storeId))
            ]);
            const StoreDetail = await dispatch(fetchStoreDetail(storeId));
            if(StoreDetail.data === null){
                navigate('/');
            }
        };
        fetchData();
    }, [dispatch, storeId,navigate]);
    const userList = useSelector(state=>state.user.userList)
    const user = useSelector(state=>state.user.userInfo);

    const handleFormSubmit = async() =>{
        try{
        const values = await form.validateFields();
        const payload = {
            username:values.username,
            password:values.password,
            storeId:storeId,
            salesName:values.salesName
        };
        const res = await dispatch(register(payload));
        console.log(res.message)
        if(res.code === 0)
        {
        message.success("Registeration Success")
        form.resetFields();
        setOpen(false);}
        else{
            message.error(res.message)
        }
    }
        catch(error){
            console.log(error)
        }
    }
    const handleClose = () =>{
        setOpen(false);
    }
    const handleOpen = () =>{
        setOpen(true);
    }

    const handleDeleteSelected = () => {
        console.log("Deleting selected items", selectionModel);
    };

    const userListWithKeys = userList.map(user => ({ ...user, key: user.id }));
      
    return (
        <div style={{ width: '100%' }}>
            <Grid container spacing={2}>
                <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="primary" onClick={handleOpen}>
                        Create Account
                    </Button>
        <Dialog open={open}  onClose={handleClose} fullWidth={true}>
            <DialogTitle>Create Account</DialogTitle>
                <DialogContent>
                    <CreateUserForm form={form}/>
                </DialogContent>
            <DialogActions>
                <Button onClick={handleFormSubmit}>Submit</Button>
                <Button onClick={handleClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
                </Grid>
                <Grid item xs={12} style={{ height: 400 }}>
                    <Table columns={columns} dataSource={userListWithKeys} ></Table>
                    
                </Grid>
            </Grid>
        </div>
    )
}

export default StoreDetail;