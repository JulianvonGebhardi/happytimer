/**
 * Switch - Custom switch component with consistent styling
 * Wraps react-switch with default props
 */

import React from 'react';
import Switch from 'react-switch';

const CustomSwitch = ({
  checked,
  onChange,
  label,
  className = '',
  ...props
}) => {
  const switchProps = {
    height: 17.5,
    width: 39.22,
    offColor: '#FDF1C3',
    onColor: '#FAD961',
    checkedIcon: false,
    uncheckedIcon: false,
    ...props,
  };

  return (
    <div className={`switch-container ${className}`}>
      {label && <span className="switch-label">{label}</span>}
      <Switch
        {...switchProps}
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
};

export default CustomSwitch;
