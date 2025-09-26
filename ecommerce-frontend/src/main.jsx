import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './App.jsx';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ToastContainer />
    <App />
  </Provider>
);