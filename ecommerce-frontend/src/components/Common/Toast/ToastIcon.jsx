import React from 'react';
import { Check, CircleAlert, TriangleAlert, Upload } from 'lucide-react';

const ToastIcon = ({ type }) => {
  const iconStyles = 'w-[40px] h-[40px] flex justify-center items-center rounded-full';
  const iconMap = {
    error: { className: `${iconStyles} bg-error/10 text-error`, icon: <TriangleAlert size={24} /> },
    info: { className: `${iconStyles} bg-info/10 text-info`, icon: <CircleAlert size={24} /> },
    success: { className: `${iconStyles} bg-success/10 text-success`, icon: <Check size={24} /> },
    warn: { className: `${iconStyles} bg-warning/10 text-warning`, icon: <TriangleAlert size={24} /> },
    loading: { className: `${iconStyles} bg-loading/10 text-loading`, icon: <Upload size={24} /> },
  };

  const { className, icon } = iconMap[type] || iconMap.success;
  return <div className={className}>{icon}</div>;
};

export default ToastIcon;
