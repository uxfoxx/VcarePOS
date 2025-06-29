import React from 'react';
import { Steps, Progress, Alert } from 'antd';
import { Icon } from './Icon';

export function EnhancedStepper({
  current = 0,
  steps = [],
  status = 'process', // 'wait' | 'process' | 'finish' | 'error'
  direction = 'horizontal',
  size = 'default',
  showProgress = false,
  progressPercent,
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
    ...step,
    status: getStepStatus(index),
    icon: step.icon ? <Icon name={step.icon} /> : undefined
  }));

  const progressValue = progressPercent || ((current + 1) / steps.length) * 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {showProgress && (
        <Progress
          percent={progressValue}
          status={status === 'error' ? 'exception' : status === 'finish' ? 'success' : 'active'}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      )}
      
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