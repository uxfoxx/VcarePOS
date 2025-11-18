import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './App.jsx';
import './index.css';


// hide all logger messages in production
if (import.meta.env.PROD) {
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
  console.debug = () => { };
  console.info = () => { };
}


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);