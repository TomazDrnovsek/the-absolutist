
import React, { useEffect, useRef } from 'react';

// Bauhaus Palette: Red, Blue, Yellow, Black
const COLORS = ['#D02028', '#1D4E89', '#EBB602', '#121212']; 

type ShapeType = 'circle' | 'square' | 'triangle';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: ShapeType;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  decay: number;
  filled: boolean;
}

interface WinEffectProps {
  isBauhausMode: boolean;
  originY?: number; // 0 to 1, percentage of parent height. Default 0.5 (center)
}

const WinEffect: React.FC<WinEffectProps> = ({ isBauhausMode, originY }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enhanced Resize Logic for High DPI + Component Support
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
          const rect = parent.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;
          
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          
          // Force CSS size to match parent
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          
          ctx.scale(dpr, dpr);
      }
    };
    
    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    
    // Calculate center based on logical size (DPR handled by scale)
    const getCenter = () => {
        const parent = canvas.parentElement;
        if (parent) {
             const x = parent.clientWidth / 2;
             // Use originY if provided, otherwise center
             const y = originY !== undefined ? parent.clientHeight * originY : parent.clientHeight / 2;
             return { x, y };
        }
        return { x: canvas.width / 2, y: canvas.height / 2 };
    };
    
    const { x: centerX, y: centerY } = getCenter();

    const createBurst = () => {
        // REDUCED COUNT: From 70 down to 24 for strict minimalist clarity
        const count = 24; 
        
        for (let i = 0; i < count; i++) {
            let angle = Math.random() * Math.PI * 2;
            let type: ShapeType = 'square';

            if (isBauhausMode) {
                // Bauhaus Logic: High structure.
                // 80% chance to snap angle to 45-degree increments (Constructivism)
                if (Math.random() > 0.2) {
                    const snap = Math.PI / 4; // 45 degrees
                    angle = Math.round(angle / snap) * snap;
                }

                // Random geometric primitive (Restricted to Square, Circle, Triangle)
                const types: ShapeType[] = ['circle', 'square', 'triangle'];
                type = types[Math.floor(Math.random() * types.length)];
            } else {
                // Normal Mode: Only Circles
                type = 'circle';
            }

            // REDUCED SPEED: "Heavy" mechanical feel vs explosion
            const speed = Math.random() * 10 + 3; 
            
            // SIZE: Slightly more uniform weight
            const size = Math.random() < 0.4 ? Math.random() * 20 + 8 : Math.random() * 8 + 6;

            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                type: type,
                rotation: Math.random() * Math.PI * 2,
                // SLOWER ROTATION: Deliberate mechanical movement
                rotationSpeed: (Math.random() - 0.5) * 0.05, 
                alpha: 1,
                // CONSISTENT DECAY: Clean fade out
                decay: 0.015 + Math.random() * 0.015,
                filled: Math.random() > 0.2 
            });
        }
    };

    createBurst();

    let animationId: number;

    const render = () => {
      // Clear bounds
      const parent = canvas.parentElement;
      const width = parent ? parent.clientWidth : canvas.width;
      const height = parent ? parent.clientHeight : canvas.height;

      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        
        // HIGHER FRICTION: Air resistance feels thicker
        p.vx *= 0.93; 
        p.vy *= 0.93;

        // HEAVIER GRAVITY: Objects feel solid
        p.vy += 0.15;

        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.filled) {
            ctx.fillStyle = p.color;
        } else {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.5; 
        }

        ctx.beginPath();

        switch (p.type) {
            case 'circle':
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                break;
            case 'square':
                ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
                break;
            case 'triangle':
                const h = p.size * (Math.sqrt(3)/2);
                ctx.moveTo(0, -h/2);
                ctx.lineTo(-p.size/2, h/2);
                ctx.lineTo(p.size/2, h/2);
                ctx.closePath();
                break;
        }

        if (p.filled) ctx.fill();
        else ctx.stroke();

        ctx.restore();
      }

      if (particles.length > 0) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [isBauhausMode, originY]);

  return (
    <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-40 pointer-events-none mix-blend-multiply" 
    />
  );
};

export default WinEffect;
