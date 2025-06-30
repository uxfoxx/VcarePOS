import React from 'react';
import { Steps, Alert } from 'antd';
import { Icon } from './Icon';

export function EnhancedStepper({
  current = 0,
  steps = [],
  status = 'process', // 'wait' | 'process' | 'finish' | 'error'
  direction = 'horizontal',
  size = 'default',
  errorMessage,
  className = '',
  onChange,
  ...props
}) {
  const getStepStatus = (stepIndex) => {
    if (stepIndex < current) return 'finish';
    if (stepIndex === current) return status;
    return 'wait';
  };

  const enhancedSteps = steps.map((step, index) => ({
    title: step.title,
    description: step.description,
    status: getStepStatus(index),
    icon: step.icon ? <Icon name={step.icon} /> : undefined
  }));

  return (
    <div className={`space-y-4 ${className}`}>
      {status === 'error' && errorMessage && (
        <Alert
          message="Step Error"
          description={errorMessage}
          type="error"
          showIcon
          className="mb-4"
        />
      )}
      
      <Steps
        current={current}
        status={status}
        direction={direction}
        size={size}
        items={enhancedSteps}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}