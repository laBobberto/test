import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1,
  className = '',
  suffix = '',
}) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(prevValue.current, value, {
      duration,
      onUpdate(latest) {
        node.textContent = Math.floor(latest).toString() + suffix;
      },
    });

    prevValue.current = value;

    return () => controls.stop();
  }, [value, duration, suffix]);

  return <span ref={nodeRef} className={className}>{value}{suffix}</span>;
};
