import React, { useState, useEffect, useRef } from 'react';
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
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isPressed) return;
    
    // 1. Immediate Feedback
    setIsPressed(true);
    audio.triggerHaptic(15);

    // 2. The "Latch"
    setTimeout(() => {
      if (isMounted.current) {
        // 3. Release
        setIsPressed(false);
        // 4. Action
        onTrigger();
      }
    }, 150);
  };

  return (
    <button
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