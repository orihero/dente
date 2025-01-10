import React, { useEffect, useRef, useState } from 'react';
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
      // Original SVG dimensions
      const originalWidth = 903;
      const originalHeight = 980;

      // Calculate scale based on container width
      const newScale = containerWidth / originalWidth;
      setScale(newScale);
    }
  };

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <TeethSvg onClick={onClick} />
      </div>
    </div>
  );
};