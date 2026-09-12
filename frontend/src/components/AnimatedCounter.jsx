import { useEffect, useState } from 'react';

/**
 * AnimatedCounter Component
 * Smoothly animates numbers count-up from 0 to target value using requestAnimationFrame.
 */
export default function AnimatedCounter({ end = 0, duration = 1000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = Number(end) || 0;
    if (target === 0) {
      setCount(0);
      return;
    }

    let startTime = null;
    let animationFrameId;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Ease-out cubic: 1 - Math.pow(1 - progress, 3)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOut * target);

      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString('id-ID')}
      {suffix}
    </span>
  );
}
