/**
 * Switch - Custom switch component with consistent styling
 * Wraps react-switch with default props
 */

import React from 'react';
import Switch from 'react-switch';

interface CustomSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  height?: number;
  width?: number;
  offColor?: string;
  onColor?: string;
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  checked,
  onChange,
  label,
  className = '',
  height = 17.5,
  width = 39.22,
  offColor = '#FDF1C3',
  onColor = '#FAD961',
  checkedIcon = false,
  uncheckedIcon = false,
}) => {
  return (
    <div className={`switch-container ${className}`}>
      {label && <span className="switch-label">{label}</span>}
      <Switch
        height={height}
        width={width}
        offColor={offColor}
        onColor={onColor}
        checkedIcon={checkedIcon}
        uncheckedIcon={uncheckedIcon}
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
};

export default CustomSwitch;
