'use client';

import { motion } from 'framer-motion';
import { CustomImage } from '@/components/ui/image';

export function AnimatedLogo() {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{
          duration: 10,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        <CustomImage
          src="/images/logo_orbia_sin_texto.png"
          alt="Orbia Logo"
          width={120}
          height={120}
          className="w-full h-full object-contain"
        />
      </motion.div>
      <div className="relative z-10">
        <CustomImage
          src="/images/orbia_text_transparent.png"
          alt="Orbia"
          width={80}
          height={40}
          className="w-20 h-auto"
        />
      </div>
    </div>
  );
}
