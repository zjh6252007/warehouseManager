import React from 'react';
import { Container, Grid, Paper, Typography, Button, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { changePassword } from '../redux/modules/user';
import { Modal,Form,Input,message } from 'antd';
import { clearUserInfo } from '../redux/modules/user';
import { useNavigate } from 'react-router-dom';
const Profile = () => {
  const userInfo = useSelector(state=>state.user.userInfo);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFinish = (values) => {
    const { currentPassword, newPassword } = values;
    const data = {
      current_pwd: currentPassword,
      new_pwd: newPassword,
    };
    dispatch(changePassword(data)).then((res) => {
      if (res.code === 0) {
        message.success('Password changed successfully.Please login with your new password.');
        setIsModalVisible(false);
        dispatch(clearUserInfo());
        nav("/login");
      } else {
        message.error(res.message);
      }
    }).catch((error) => {
      message.error('Error changing password');
    });
  };


  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Username Section */}
          <Grid item xs={12}>
            <Typography variant="h6">Username</Typography>
            <Typography variant="body1">{userInfo.username}</Typography>
          </Grid>
          
          {/* Divider */}
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          {/* Password Section */}
          <Grid item xs={12}>
            <Typography variant="h6">Password</Typography>
            <Button variant="contained" color="primary" onClick={showModal}>
              Change Password
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Modal
        title="Change Password"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          name="changePassword"
          onFinish={handleFinish}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please input your current password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 8, message: 'Password must be at least 8 characters long!' },
              { pattern: /[!@#$%^&*(),.?":{}|<>]/, message: 'Password must contain at least one special character!' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </Container>
  );
};

export default Profile;