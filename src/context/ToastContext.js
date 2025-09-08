import React, { createContext, useContext, useState } from 'react';
import ToastMessage from '../components/ToastMessage';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'error',
  });

  const show = (message, type = 'error') => {
    setToast({ visible: true, message, type });

    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastMessage
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </ToastContext.Provider>
  );
};
