import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';

const { Text } = Typography;

export function AnimatedCounter({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  precision = 0,
  className = '',
  style = {},
  ...props
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const { theme: themeSettings } = useTheme();

  useEffect(() => {
    if (!themeSettings.animations) {
      setDisplayValue(value);
      return;
    }

    let startTime;
    let startValue = displayValue;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (value - startValue) * easeOutQuart;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration, themeSettings.animations]);

  const formatValue = (val) => {
    return precision > 0 ? val.toFixed(precision) : Math.round(val);
  };

  return (
    <Text
      className={`animated-counter ${className}`}
      style={{
        fontVariantNumeric: 'tabular-nums',
        ...style
      }}
      {...props}
    >
      {prefix}{formatValue(displayValue)}{suffix}
    </Text>
  );
}