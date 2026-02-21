import React, { useState } from 'react';
import { audio } from '../utils/audio';

interface MechanicalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onTrigger: () => void;
  scaleActive?: number;
}

const MechanicalButton: React.FC<MechanicalButtonProps> = ({ 
  onTrigger, 
  scaleActive = 0.95,
  className = '',
  style,
  disabled,
  children,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    audio.triggerHaptic(15);
    onTrigger();
  };

  return (
    <button
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleClick}
      disabled={disabled}
      className={`${className} transition-transform duration-100 ease-out`}
      style={{
        ...style,
        transform: isPressed ? `scale(${scaleActive})` : 'scale(1)',
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default MechanicalButton;
