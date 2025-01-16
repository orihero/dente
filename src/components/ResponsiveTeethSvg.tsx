import React, { useState, useEffect, useRef } from 'react';
import { TeethSvg } from './TeethSvg';

interface ResponsiveTeethSvgProps {
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
}

export const ResponsiveTeethSvg: React.FC<ResponsiveTeethSvgProps> = ({ onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const updateScale = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Original SVG dimensions
      const originalWidth = 903;
      const originalHeight = 980;

      // Calculate scale based on container dimensions
      const scaleX = containerWidth / originalWidth;
      const scaleY = containerHeight / originalHeight;
      
      // Use the smaller scale to ensure the SVG fits both dimensions
      const newScale = Math.min(scaleX, scaleY) * 0.96; // Make it 20% bigger than 0.8 (0.8 * 1.2 = 0.96)
      
      setScale(newScale);
    }
  };

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center"
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <TeethSvg onClick={onClick} />
      </div>
    </div>
  );
};