import React from 'react';

const ToastMessage = ({ message, subMessage, type }) => {
  const messageStyles = {
    error: 'text-error font-semibold text-sm',
    info: 'text-info font-semibold text-sm',
    success: 'text-success font-semibold text-sm',
    warn: 'text-warning font-semibold text-sm',
    loading: 'text-loading font-semibold text-sm',
  };

  return (
    <div>
      <div className={messageStyles[type] || messageStyles.success}>{message}</div>
      {subMessage && <div className="text-secondaryColorDark font-medium text-xs">{subMessage}</div>}
      {type === 'loading' && <div className="uploader-loader mt-3"></div>}
    </div>
  );
};

export default ToastMessage;
