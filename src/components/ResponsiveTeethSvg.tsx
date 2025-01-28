import React, { useState, useEffect, useRef } from 'react';
import { TeethSvg } from './TeethSvg';
import { MilkTeethSvg } from './MilkTeethSvg';
import { ModuleDiagram } from './ModuleDiagram';
import { MilkModuleDiagram } from './MilkModuleDiagram';

interface ResponsiveTeethSvgProps {
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
  type?: 'adult' | 'milk' | 'module' | 'milk-module';
}

export const ResponsiveTeethSvg: React.FC<ResponsiveTeethSvgProps> = ({ 
  onClick,
  type = 'adult'
}) => {
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
      const newScale = Math.min(scaleX, scaleY) * 0.96;
      
      setScale(newScale);
    }
  };

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  

  const renderDiagram = () => {
    const props = {
      onClick,
      style: { 
        cursor: 'pointer',
        pointerEvents: 'all',
        touchAction: 'none' // Prevent touch scrolling while interacting with SVG
      } as React.CSSProperties
    };

    switch (type) {
      case 'milk':
        return <MilkTeethSvg {...props} />;
      case 'module':
        return <ModuleDiagram {...props} />;
      case 'milk-module':
        return <MilkModuleDiagram {...props} />;
      default:
        return <TeethSvg {...props} />;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center"
    >
      <div 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'center center',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent' // Remove tap highlight on mobile
        }}
      >
        {renderDiagram()}
      </div>
    </div>
  );
};