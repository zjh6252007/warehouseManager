
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import router from './router/router';
import enUS from 'antd/lib/calendar/locale/en_US';
function App() {
  return (
    <ConfigProvider locale={enUS}>
    <div className="App">
      <RouterProvider router={router}></RouterProvider>
    </div>
    </ConfigProvider>
  );
}

export default App;
