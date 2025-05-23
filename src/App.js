
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import router from './router/router';
import enUS from 'antd/lib/calendar/locale/en_US';
import { LoadScript } from '@react-google-maps/api';

function App() {
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyCxr6sQdQu-i9V1UuvkSD2WxTqJOva6VZc"
      libraries={['places']}
      >
    <ConfigProvider locale={enUS}>
    <div className="App">
      <RouterProvider router={router}></RouterProvider>
    </div>
    </ConfigProvider>
    </LoadScript>
  );
}

export default App;
