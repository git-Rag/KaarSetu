'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface StatsCounterProps {
  value: number | string;
  suffix?: string;
  prefix?: string;
  label: string;
  numeric?: boolean;
}

export function StatsCounter({
  value,
  suffix = '',
  prefix = '',
  label,
  numeric = true,
}: StatsCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 2000, bounce: 0 });
  const display = useTransform(spring, (v) => {
    if (!numeric) return String(value);
    if (typeof value === 'string') return value;
    return `${prefix}${Math.round(v).toLocaleString('en-IN')}${suffix}`;
  });

  useEffect(() => {
    if (isInView && numeric && typeof value === 'number') {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value, numeric]);

  if (!numeric) {
    return (
      <div ref={ref} className="text-center">
        <p className="font-display text-3xl font-bold text-saffron md:text-4xl">
          {prefix}
          {value}
          {suffix}
        </p>
        <p className="mt-1 text-sm text-text-secondary">{label}</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="text-center">
      <motion.p className="font-display text-3xl font-bold text-saffron md:text-4xl">
        {display}
      </motion.p>
      <p className="mt-1 text-sm text-text-secondary">{label}</p>
    </div>
  );
}
