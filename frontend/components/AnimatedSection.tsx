// components/AnimatedSection.tsx
'use client';

import { motion } from 'framer-motion';

export const AnimatedSection = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);