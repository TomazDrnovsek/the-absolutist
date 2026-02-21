
import React from 'react';
import { getBauhausShape } from '../utils/shapes';
import { BauhausShapeType } from '../types';

interface ShapePrimitiveProps {
  hue: number;
  color: string;
  isBauhausMode: boolean;
  hasBorder?: boolean;
  strokeWidth?: string;
  variant?: 'solid' | 'outline';
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ShapePrimitive: React.FC<ShapePrimitiveProps> = ({ 
  hue, 
  color, 
  isBauhausMode,
  hasBorder = false,
  strokeWidth,
  variant = 'solid',
  id,
  className = '',
  style = {}
}) => {
  // 1. Standard Mode: Return a simple div (Truth to Materials)
  if (!isBauhausMode) {
    return (
      <div 
        className={className}
        style={{ 
          backgroundColor: color,
          ...style
        }} 
      />
    );
  }

  // 2. Bauhaus Mode: Render SVG Primitive
  const shape: BauhausShapeType = getBauhausShape(hue);

  // Full Bleed 64x64 Geometry (Maximum Visual Weight)
  // Added vectorEffect="non-scaling-stroke" for crisp 1px hairlines regardless of scaling
  const getShapePath = (s: BauhausShapeType) => {
    switch (s) {
      case 'square': 
        return <rect x="0" y="0" width="64" height="64" vectorEffect="non-scaling-stroke" />;
      case 'triangle': 
        return <polygon points="32,0 64,64 0,64" vectorEffect="non-scaling-stroke" />;
      case 'trapezoid': 
        return <polygon points="12,0 52,0 64,64 0,64" vectorEffect="non-scaling-stroke" />;
      case 'rhombus': 
        return <polygon points="32,0 64,32 32,64 0,32" vectorEffect="non-scaling-stroke" />;
      case 'l-beam': 
        return <path d="M0,0 H24 V40 H64 V64 H0 Z" vectorEffect="non-scaling-stroke" />;
      case 'semi-circle': 
        return <path d="M0,48 A32,32 0 0,1 64,48 Z" vectorEffect="non-scaling-stroke" />;
      case 'circle': 
        return <circle cx="32" cy="32" r="32" vectorEffect="non-scaling-stroke" />;
      case 'capsule': 
        return <rect x="0" y="16" width="64" height="32" rx="16" vectorEffect="non-scaling-stroke" />;
      case 'cross': 
        return <path d="M24,0 H40 V24 H64 V40 H40 V64 H24 V40 H0 V24 H24 Z" vectorEffect="non-scaling-stroke" />;
      default: 
        return <rect x="0" y="0" width="64" height="64" vectorEffect="non-scaling-stroke" />;
    }
  };

  const shapeElement = getShapePath(shape);

  // 2a. Outline Mode (Uniform detached border via Masking)
  if (variant === 'outline') {
      const maskId = `mask-${id || Math.random().toString(36).substring(7)}`;
      // Uses vectorEffect="non-scaling-stroke" to maintain consistent pixel widths
      // Inner Gap: 3px (strokeWidth 6) -> 3px on each side of the edge
      // Visible Border: 0.9px (strokeWidth 7.8) -> 3.9px on each side of the edge
      // The mask hides the inner 3px. The stroke extends to 3.9px.
      // Result: A 0.9px line starting at 3px from the shape edge.
      return (
        <div className={`${className} flex items-center justify-center`} style={style}>
            <svg 
                viewBox="0 0 64 64" 
                className="w-full h-full"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <mask id={maskId} x="-50%" y="-50%" width="200%" height="200%">
                        <rect x="-100%" y="-100%" width="300%" height="300%" fill="white" />
                        {React.cloneElement(shapeElement, {
                            fill: 'black',
                            stroke: 'black',
                            strokeWidth: '6', // 3px gap
                        })}
                    </mask>
                </defs>
                {React.cloneElement(shapeElement, {
                    fill: 'none',
                    stroke: '#121212',
                    strokeWidth: '7.8', // 3px gap + 0.9px border
                    mask: `url(#${maskId})`,
                })}
            </svg>
        </div>
      );
  }

  // 2b. Solid Mode
  const appliedStrokeWidth = strokeWidth || (hasBorder ? '0.8px' : '0');

  return (
    <div className={`${className} flex items-center justify-center`} style={style}>
        <svg 
            viewBox="0 0 64 64" 
            className="w-full h-full transition-all duration-300"
            style={{ 
                fill: color,
                stroke: hasBorder ? '#121212' : 'none',
                strokeWidth: appliedStrokeWidth,
                overflow: 'visible',
                transform: 'translateZ(0)',
            }}
        >
            {shapeElement}
        </svg>
    </div>
  );
};

export default ShapePrimitive;
