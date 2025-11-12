'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const BouncingLogo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 1, y: 1 });
  const logoWidth = 110;
  const logoHeight = 120;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;

        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        if (newX <= 0 || newX + logoWidth >= containerWidth) {
          velocity.x = -velocity.x;
          newX = prev.x + velocity.x;
        }
        if (newY <= 0 || newY + logoHeight >= containerHeight) {
          velocity.y = -velocity.y;
          newY = prev.y + velocity.y;
        }

        return { x: newX, y: newY };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [velocity]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div
        className="absolute bg-white h-[120px] w-[110px] flex justify-center p-2"
        style={{ left: position.x, top: position.y }}
      >
        <Image
          src="/easywritelogo.png"
          height={100}
          width={100}
          alt="easywrite logo"
        />
      </div>
    </div>
  );
};

export default BouncingLogo;
