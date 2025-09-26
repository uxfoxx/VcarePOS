import { toast } from 'react-toastify';
import ToastIcon from './ToastIcon';
import ToastMessage from './ToastMessage';

export const showToast = ({ message, subMessage, type = 'info', options = {}, toastId }) => {
  if (toastId) toast.dismiss(toastId);

  const uniqueToastId = toastId || `${type}-${Date.now()}`;

  toast[type](<ToastMessage message={message} subMessage={subMessage} type={type} />, {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light',
    icon: () => <ToastIcon type={type} />,
    toastId: uniqueToastId,
    ...options,
  });
};

export const showPersistentToast = ({ message, subMessage, type = 'info', options = {}, toastId }) => {
  toast[type](<ToastMessage message={message} subMessage={subMessage} type={type} />, {
    position: 'top-center',
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light',
    icon: () => <ToastIcon type={type} />,
    toastId,
    ...options,
  });
};
