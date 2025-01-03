import { toast } from 'react-toastify';

const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  style: {
    fontSize: '0.875rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
};

const successStyle = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: '#f0f9f4',
    color: '#1e4d2b',
    border: '1px solid #c3e6cb',
  },
};

const errorStyle = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: '#fdf3f4',
    color: '#712b29',
    border: '1px solid #f5c6cb',
  },
  autoClose: 5000,
};

const infoStyle = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: '#e8f4fd',
    color: '#004085',
    border: '1px solid #b8daff',
  },
};

class NotificationService {
  success(message) {
    return toast.success(message, successStyle);
  }

  error(message) {
    return toast.error(message, errorStyle);
  }

  info(message) {
    return toast.info(message, infoStyle);
  }
}

const notificationService = new NotificationService();
export default notificationService;